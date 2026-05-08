const scriptKey = 'AKfycbygZQJ5zc9Uz8i9SHi4r7dww_qRd0ZDhi85JAJQy0xd07Fc7LT4h_nx08NpOTYgSlEBCA';

const buildApiUrl = (key: string) => `https://script.google.com/macros/s/${key}/exec`;

export const environment = {
  production: false,
  scriptKey,
  token: 'MY_SECRET_KEY',
  defaultCycleStartDay: 25,
  apiUrl: buildApiUrl(scriptKey),
  googleSheetId: '1HjiojQtfHcyWtFqNzHttgCO36EK7s5eEoQQl9_jxxUw',
  wishlistSheetGid: '1994871759',
  passwordHash: 'cbfdac6008f9cab4083784cbd1874f76618d2a97', // default password is password123
};
