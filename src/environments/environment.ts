const scriptKey = 'AKfycbygZQJ5zc9Uz8i9SHi4r7dww_qRd0ZDhi85JAJQy0xd07Fc7LT4h_nx08NpOTYgSlEBCA';

const buildApiUrl = (key: string) => `https://script.google.com/macros/s/${key}/exec`;

export const environment = {
  production: true,
  scriptKey,
  token: 'TOKEN_PLACEHOLDER', // To be replaced during build with actual token
  defaultCycleStartDay: 25,
  apiUrl: buildApiUrl(scriptKey),
  googleSheetId: '1HjiojQtfHcyWtFqNzHttgCO36EK7s5eEoQQl9_jxxUw',
  wishlistSheetGid: '1994871759',
  passwordHash: 'PASSWORD_HASH_PLACEHOLDER', // To be replaced during build with actual hash
};
