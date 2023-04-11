# Front-end: Vue.js
FROM node:lts-alpine AS frontend
RUN npm install pnpm -g
WORKDIR /app
COPY ./package.json /app
COPY ./pnpm-lock.yaml /app
RUN pnpm install
COPY . /app
RUN pnpm run build

# Back-end: express.js
FROM node:lts-alpine as backend
RUN npm install pnpm -g
WORKDIR /app
COPY /server/package.json /app
COPY /server/pnpm-lock.yaml /app
RUN pnpm install
COPY /server /app
RUN pnpm build

# Final image
FROM node:lts-alpine
RUN npm install pnpm -g
WORKDIR /app
COPY /server/package.json /app
COPY /server/pnpm-lock.yaml /app
RUN pnpm install --production && rm -rf /root/.npm /root/.pnpm-store /usr/local/share/.cache /tmp/*
COPY /server /app
COPY --from=frontend /app/dist /app/public
COPY --from=backend /app/build /app/build
COPY --from=backend /app/src/utils/templates /app/build/templates
EXPOSE 10829

CMD ["pnpm", "run", "prod"]
