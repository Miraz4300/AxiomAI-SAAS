import dayjs from 'dayjs'
import { md5 } from '../utils/security'
import { ObjectId, client, dbName } from './mongodb'
import type { WithId } from './mongodb'
import type { AdvancedConfig, ChatOptions, Config, KeyConfig, UsageResponse } from './model'
import { ChatInfo, ChatRoom, ChatUsage, Status, UserConfig, UserInfo, UserRole } from './model'
import { getCacheConfig } from './config'

const chatCol = client.db(dbName).collection<ChatInfo>('chat')
const roomCol = client.db(dbName).collection<ChatRoom>('chat_room')
const userCol = client.db(dbName).collection<UserInfo>('user')
const configCol = client.db(dbName).collection<Config>('config')
const usageCol = client.db(dbName).collection<ChatUsage>('chat_usage')
const keyCol = client.db(dbName).collection<KeyConfig>('key_config')

/**
 * Insert Chat Message
 * @param uuid
 * @param text Content prompt or response
 * @param roomId
 * @param options
 * @returns model
 */

export async function insertChat(uuid: number, text: string, images: string[], roomId: number, model: string, options?: ChatOptions) {
  const chatInfo = new ChatInfo(roomId, uuid, text, images, model, options)
  await chatCol.insertOne(chatInfo)
  return chatInfo
}

export async function getChat(roomId: number, uuid: number) {
  return await chatCol.findOne({ roomId, uuid })
}

export async function getChatByMessageId(messageId: string) {
  return await chatCol.findOne({ 'options.messageId': messageId })
}

export async function updateChat(chatId: string, response: string, messageId: string, conversationId: string, model: string, usage: UsageResponse, previousResponse?: []) {
  const query = { _id: new ObjectId(chatId) }
  const update = {
    $set: {
      'response': response,
      'model': model || '',
      'options.messageId': messageId,
      'options.conversationId': conversationId,
      'options.prompt_tokens': usage?.prompt_tokens,
      'options.completion_tokens': usage?.completion_tokens,
      'options.total_tokens': usage?.total_tokens,
      'options.estimated': usage?.estimated,
    },
  }

  if (previousResponse)
  // @ts-expect-error https://jira.mongodb.org/browse/NODE-5214
    update.$set.previousResponse = previousResponse

  await chatCol.updateOne(query, update)
}

export async function insertChatUsage(userId: ObjectId, roomId: number, chatId: ObjectId, messageId: string, model: string, usage: UsageResponse) {
  const chatUsage = new ChatUsage(userId, roomId, chatId, messageId, model, usage)
  await usageCol.insertOne(chatUsage)
  return chatUsage
}

export async function createChatRoom(userId: string, title: string, roomId: number, chatModel: string) {
  const room = new ChatRoom(userId, title, roomId, chatModel)
  await roomCol.insertOne(room)
  return room
}
export async function renameChatRoom(userId: string, title: string, roomId: number) {
  const query = { userId, roomId }
  const update = {
    $set: {
      title,
    },
  }
  const result = await roomCol.updateOne(query, update)
  return result.modifiedCount > 0
}

export async function deleteChatRoom(userId: string, roomId: number) {
  const result = await roomCol.updateOne({ roomId, userId }, { $set: { status: Status.Deleted } })
  await clearChat(roomId)
  return result.modifiedCount > 0
}

export async function updateRoomPrompt(userId: string, roomId: number, prompt: string) {
  const query = { userId, roomId }
  const update = {
    $set: {
      prompt,
    },
  }
  const result = await roomCol.updateOne(query, update)
  return result.modifiedCount > 0
}

export async function updateRoomUsingContext(userId: string, roomId: number, using: boolean) {
  const query = { userId, roomId }
  const update = {
    $set: {
      usingContext: using,
    },
  }
  const result = await roomCol.updateOne(query, update)
  return result.modifiedCount > 0
}

export async function updateRoomAccountId(userId: string, roomId: number, accountId: string) {
  const query = { userId, roomId }
  const update = {
    $set: {
      accountId,
    },
  }
  const result = await roomCol.updateOne(query, update)
  return result.modifiedCount > 0
}

export async function updateRoomChatModel(userId: string, roomId: number, chatModel: string) {
  const query = { userId, roomId }
  const update = {
    $set: {
      chatModel,
    },
  }
  const result = await roomCol.updateOne(query, update)
  return result.modifiedCount > 0
}

export async function getChatRoomsCount(userId: string, page: number, size: number) {
  let total = 0
  const skip = (page - 1) * size
  const limit = size
  const agg = []
  if (userId !== null && userId !== 'undefined' && userId !== undefined && userId.trim().length !== 0) {
    agg.push({
      $match: {
        userId,
      },
    })
    total = await roomCol.countDocuments({ userId })
  }
  else {
    total = await roomCol.countDocuments()
  }
  const agg2 = [
    {
      $lookup: {
        from: 'chat',
        localField: 'roomId',
        foreignField: 'roomId',
        as: 'chat',
      },
    }, {
      $addFields: {
        title: '$chat.prompt',
        user_ObjectId: {
          $toObjectId: '$userId',
        },
      },
    }, {
      $lookup: {
        from: 'user',
        localField: 'user_ObjectId',
        foreignField: '_id',
        as: 'user',
      },
    }, {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: false,
      },
    }, {
      $sort: {
        'chat.dateTime': -1,
      },
    }, {
      $addFields: {
        chatCount: {
          $size: '$chat',
        },
        chat: {
          $arrayElemAt: [
            {
              $slice: [
                '$chat', -1,
              ],
            }, 0,
          ],
        },
      },
    }, {
      $project: {
        userId: 1,
        title: '$chat.prompt',
        username: '$user.name',
        roomId: 1,
        chatCount: 1,
        dateTime: '$chat.dateTime',
      },
    }, {
      $sort: {
        dateTime: -1,
      },
    }, {
      $skip: skip,
    }, {
      $limit: limit,
    },
  ]
  Array.prototype.push.apply(agg, agg2)

  const cursor = roomCol.aggregate(agg)
  const data = await cursor.toArray()
  return { total, data }
}

export async function getChatRooms(userId: string) {
  const cursor = roomCol.find({ userId, status: { $ne: Status.Deleted } })
  const rooms = []
  for await (const doc of cursor)
    rooms.push(doc)
  return rooms
}

export async function getChatRoom(userId: string, roomId: number) {
  return await roomCol.findOne({ userId, roomId, status: { $ne: Status.Deleted } }) as ChatRoom
}

export async function existsChatRoom(userId: string, roomId: number) {
  const room = await roomCol.findOne({ roomId, userId })
  return !!room
}

export async function deleteAllChatRooms(userId: string) {
  await roomCol.updateMany({ userId, status: Status.Normal }, { $set: { status: Status.Deleted } })
  await chatCol.updateMany({ userId, status: Status.Normal }, { $set: { status: Status.Deleted } })
}

export async function getChats(roomId: number, lastId?: number, all?: string): Promise<ChatInfo[]> {
  if (!lastId)
    lastId = new Date().getTime()
  let query = {}
  if (all === null || all === 'undefined' || all === undefined || all.trim().length === 0)
    query = { roomId, uuid: { $lt: lastId }, status: { $ne: Status.Deleted } }
  else
    query = { roomId, uuid: { $lt: lastId } }

  const limit = 20
  const cursor = chatCol.find(query).sort({ dateTime: -1 }).limit(limit)
  const chats = []
  for await (const doc of cursor)
    chats.push(doc)
  chats.reverse()
  return chats
}

export async function clearChat(roomId: number) {
  const query = { roomId }
  const update = {
    $set: {
      status: Status.Deleted,
    },
  }
  await chatCol.updateMany(query, update)
}

export async function deleteChat(roomId: number, uuid: number, inversion: boolean) {
  const query = { roomId, uuid }
  let update = {
    $set: {
      status: Status.Deleted,
    },
  }
  const chat = await chatCol.findOne(query)
  if (chat.status === Status.InversionDeleted && !inversion) { /* empty */ }
  else if (chat.status === Status.ResponseDeleted && inversion) { /* empty */ }
  else if (inversion) {
    update = {
      $set: {
        status: Status.InversionDeleted,
      },
    }
  }
  else {
    update = {
      $set: {
        status: Status.ResponseDeleted,
      },
    }
  }
  await chatCol.updateOne(query, update)
}

export async function createUser(email: string, password: string, roles?: UserRole[], status?: Status, remark?: string): Promise<UserInfo> {
  email = email.toLowerCase()
  const userInfo = new UserInfo(email, password)
  if (roles && roles.includes(UserRole.Admin))
    userInfo.status = Status.Normal
  if (status)
    userInfo.status = status

  userInfo.roles = roles
  userInfo.remark = remark
  await userCol.insertOne(userInfo)
  return userInfo
}

export async function updateUserInfo(userId: string, user: UserInfo) {
  await userCol.updateOne({ _id: new ObjectId(userId) }
    , { $set: { avatar: user.avatar, name: user.name, title: user.title } })
}

export async function updateUserChatModel(userId: string, chatModel: string) {
  await userCol.updateOne({ _id: new ObjectId(userId) }
    , { $set: { 'config.chatModel': chatModel } })
}

export async function updateUserAdvancedConfig(userId: string, config: AdvancedConfig) {
  await userCol.updateOne({ _id: new ObjectId(userId) }
    , { $set: { advanced: config } })
}

export async function updateUserMFA(userId: string, secretKey: string) {
  await userCol.updateOne({ _id: new ObjectId(userId) }
    , { $set: { secretKey, updateTime: new Date() } })
}

export async function disableUserMFA(userId: string) {
  await userCol.updateOne({ _id: new ObjectId(userId) }
    , { $set: { secretKey: null, updateTime: new Date() } })
}

export async function updateUserPassword(userId: string, password: string) {
  await userCol.updateOne({ _id: new ObjectId(userId) }
    , { $set: { password, updateTime: new Date() } })
}

export async function updateUserPasswordWithVerifyOld(userId: string, oldPassword: string, newPassword: string) {
  return userCol.updateOne({ _id: new ObjectId(userId), password: oldPassword }
    , { $set: { password: newPassword, updateTime: new Date() } })
}

export async function getUser(email: string): Promise<UserInfo> {
  email = email.toLowerCase()
  const userInfo = await userCol.findOne({ email })
  await initUserInfo(userInfo)
  return userInfo
}

// For dashboard component
export async function getDashboardData() {
  const subscriptionRoles = [UserRole.Premium, UserRole.MVP, UserRole.Support, UserRole.Basic, UserRole['Basic+']]

  // using $facet to get multiple aggregations in a single query for better performance
  const [result] = await userCol.aggregate([
    {
      $facet: {
        total: [{ $count: 'total' }], // Get the total number of users
        normal: [{ $match: { status: Status.Normal } }, { $count: 'normal' }], // Get the number of normal users
        disabled: [{ $match: { status: Status.Disabled } }, { $count: 'disabled' }], // Get the number of disabled users
        subscribed: [{ $match: { roles: { $in: subscriptionRoles } } }, { $count: 'subscribed' }], // Get the number of subscribed users
        premium: [{ $match: { roles: UserRole.Premium } }, { $count: 'premium' }], // Get the number of premium users
        users: [{ $project: { _id: 0, email: 1, createTime: 1, status: 1 } }, { $sort: { createTime: -1 } }, { $limit: 5 }], // Get the latest 5 users with their email, createTime and status
        subscribedUsers: [{ $match: { roles: { $in: subscriptionRoles } } }, { $project: { _id: 0, email: 1, roles: 1, remark: 1 } }], // Get all subscribed users with their email, roles and remark
      },
    },
  ]).toArray()

  return {
    total: result.total[0]?.total || 0,
    normal: result.normal[0]?.normal || 0,
    disabled: result.disabled[0]?.disabled || 0,
    subscribed: result.subscribed[0]?.subscribed || 0,
    premium: result.premium[0]?.premium || 0,
    newUsers: result.users,
    subscribedUsers: result.subscribedUsers,
  }
}

// For user management component
export async function getUsers(page: number, size: number, searchQuery?: string): Promise<{ users: UserInfo[]; total: number }> {
  const query: any = { status: { $ne: Status.Deleted } }

  // If a search query is provided, add it to the query
  if (searchQuery?.trim())
    query.email = { $regex: new RegExp(searchQuery, 'i') }

  const total = await userCol.countDocuments(query)
  const users: UserInfo[] = await userCol.find(query)
    .sort({ createTime: -1 }) // Sort users by createTime in descending order
    .skip((page - 1) * size) // Skip the documents that come before the page
    .limit(size) // Limit the results to the page size
    .toArray() as UserInfo[]

  users.forEach(initUserInfo)

  return { users, total }
}

export async function getUserById(userId: string): Promise<UserInfo> {
  const userInfo = await userCol.findOne({ _id: new ObjectId(userId) })
  await initUserInfo(userInfo)
  return userInfo
}

async function initUserInfo(userInfo: WithId<UserInfo>) {
  if (userInfo == null)
    return
  if (userInfo.config == null)
    userInfo.config = new UserConfig()
  if (userInfo.config.chatModel == null)
    userInfo.config.chatModel = 'gpt-3.5-turbo'
  if (userInfo.roles == null || userInfo.roles.length <= 0) {
    userInfo.roles = []
    if (process.env.ROOT_USER === userInfo.email.toLowerCase())
      userInfo.roles.push(UserRole.Admin)
    userInfo.roles.push(UserRole.Free)
  }
  if (!userInfo.advanced)
    userInfo.advanced = (await getCacheConfig()).advancedConfig
}

export async function verifyUser(email: string, status: Status) {
  email = email.toLowerCase()
  await userCol.updateOne({ email }, { $set: { status, verifyTime: new Date() } })
}

export async function updateUserStatus(userId: string, status: Status) {
  await userCol.updateOne({ _id: new ObjectId(userId) }, { $set: { status, verifyTime: new Date() } })
}

export async function updateUser(userId: string, roles: UserRole[], password: string, remark?: string, message?: string) {
  const user = await getUserById(userId)
  const query = { _id: new ObjectId(userId) }
  if (user.password !== password && user.password) {
    const newPassword = md5(password)
    await userCol.updateOne(query, { $set: { roles, verifyTime: new Date(), password: newPassword, remark, message } })
  }
  else {
    await userCol.updateOne(query, { $set: { roles, verifyTime: new Date(), remark, message } })
  }
}

// For updateRole middleware
export async function updateUserRole(userId: string, roles: UserRole[]) {
  await userCol.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { roles }, $unset: { remark: 1 } },
  )
}

// For updateRole middleware
export async function getFilterData() {
  return userCol.find(
    { remark: { $exists: true } },
    { projection: { _id: 1, email: 1, name: 1, roles: 1, remark: 1 } },
  ).toArray()
}

export async function getConfig(): Promise<Config> {
  return await configCol.findOne() as Config
}

export async function updateConfig(config: Config): Promise<Config> {
  const result = await configCol.replaceOne({ _id: config._id }, config, { upsert: true })
  if (result.modifiedCount > 0 || result.upsertedCount > 0)
    return config
  if (result.matchedCount > 0 && result.modifiedCount <= 0 && result.upsertedCount <= 0)
    return config
  return null
}

export async function getUserStatisticsByDay(userId: ObjectId, start: number, end: number): Promise<any> {
  const pipeline = [
    { // filter by dateTime
      $match: {
        dateTime: {
          $gte: start,
          $lte: end,
        },
        userId,
      },
    },
    { // convert dateTime to date
      $addFields: {
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $toDate: '$dateTime',
            },
          },
        },
      },
    },
    { // group by date
      $group: {
        _id: '$date',
        promptTokens: {
          $sum: '$promptTokens',
        },
        completionTokens: {
          $sum: '$completionTokens',
        },
        totalTokens: {
          $sum: '$totalTokens',
        },
      },
    },
    { // sort by date
      $sort: {
        _id: 1,
      },
    },
  ]

  const aggStatics = await usageCol.aggregate(pipeline).toArray()

  const step = 86400000 // 1 day in milliseconds
  const result = {
    promptTokens: null,
    completionTokens: null,
    totalTokens: null,
    chartData: [],
  }
  for (let i = start; i <= end; i += step) {
    // Convert the timestamp to a Date object
    const date = dayjs(i, 'x').format('YYYY-MM-DD')

    const dateData = aggStatics.find(x => x._id === date) || { _id: date, promptTokens: 0, completionTokens: 0, totalTokens: 0 }

    result.promptTokens += dateData.promptTokens
    result.completionTokens += dateData.completionTokens
    result.totalTokens += dateData.totalTokens
    result.chartData.push(dateData)
  }

  return result
}

export async function getKeys(): Promise<{ keys: KeyConfig[]; total: number }> {
  const query = { status: { $ne: Status.Disabled } }
  const cursor = keyCol.find(query)
  const total = await keyCol.countDocuments(query)
  const keys = []
  for await (const doc of cursor)
    keys.push(doc)
  return { keys, total }
}

export async function upsertKey(key: KeyConfig): Promise<KeyConfig> {
  if (key._id === undefined)
    await keyCol.insertOne(key)
  else
    await keyCol.replaceOne({ _id: key._id }, key, { upsert: true })
  return key
}

export async function updateApiKeyStatus(id: string, status: Status) {
  await keyCol.updateOne({ _id: new ObjectId(id) }, { $set: { status } })
}
