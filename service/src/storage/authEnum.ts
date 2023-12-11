export enum authErrorType {
  ABNORMAL = 'SINGULARITY_SHUTDOWN', // If user status is disabled or deleted
  PERMISSION = 'INTERSTELLAR_AUTHORIZATION_REQUIRED', // If registration review is enabled. After creating account, if user trying to login or signup.
  UNVERIFIED = 'COSMIC_CLEARANCE_REQUIRED', // If user status is unverified and trying to login or reset password
  NOTFOUND = 'GALACTIC_GHOST', // If user is not found in database
  USDV = 'USDV_CLEVER', // If user status is deleted and trying to verify the account
}

export enum authInfoType {
  AASV = 'AASV', // Admin account successfully verified
  SRPM = 'SRPM', // Send reset password mail
  PRSC = 'PRSC', // Password reset successfully completed
  VERIFIED = 'VERIFIED', // If user is verifying the account
  UNVERIFIED = 'UNVERIFIED', // If user signup for the first time
  UNVERIFIED2 = 'UNVERIFIED_CHANNEL_SU', // If user is unverified and trying to signup
  PERMISSION = 'PERMISSION_APR', // If registration review is enabled and user is verifying the account for the first time
  PERMISSION2 = 'PERMISSION_CLEVER', // If registration review is enabled and user is trying to verify the account
}
