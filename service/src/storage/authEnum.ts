export enum authErrorType {
  ABNORMAL = 'SINGULARITY_SHUTDOWN', // If user status is disabled or deleted
  ABNORMAL2 = '503-ODD', // If user status is not normal in certain cases
  BANNED = '402-RST', // If user is banned
  NOTFOUND = 'GALACTIC_GHOST', // If user is not found in database
  PERMISSION = 'INTERSTELLAR_AUTHORIZATION_REQUIRED', // If registration review is enabled. After creating account, if user trying to login or signup.
  UNVERIFIED = 'COSMIC_CLEARANCE_REQUIRED', // If user status is unverified and trying to login or reset password
  USDV = 'USDV_CLEVER', // If user status is deleted and trying to verify the account
}

export enum authInfoType {
  AASV = 'AASV', // Admin account successfully verified
  PERMISSION = 'PERMISSION_APR', // If registration review is enabled and user is verifying the account for the first time
  PERMISSION2 = 'PERMISSION_CLEVER', // If registration review is enabled and user is trying to verify the account
  PRSC = 'PRSC', // Password reset successfully completed
  SRPM = 'SRPM', // Send reset password mail
  UNVERIFIED = 'UNVERIFIED', // If user signup for the first time
  UNVERIFIED2 = 'UNVERIFIED_CHANNEL_SU', // If user status is unverified and trying to signup again
  VERIFIED = 'VERIFIED', // If user is verifying the account
}

export enum authMsg {
  INVALID_EMAIL = 'Please enter a valid email address! Repeated attempts to enter multiple spam email addresses may result in a permanent ban for your geolocation.', // If user is trying to signup with spam or disposable email address
  RESTRICTED_EMAIL = 'This email address is not allowed', // If user is trying to signup with restricted email address
  EXISTS_EMAIL = 'The email address given has already been registered within our system!', // If user is trying to signup with already registered email address
}
