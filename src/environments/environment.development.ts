const scriptKey = 'AKfycbygZQJ5zc9Uz8i9SHi4r7dww_qRd0ZDhi85JAJQy0xd07Fc7LT4h_nx08NpOTYgSlEBCA';

const buildApiUrl = (key: string) => `https://script.google.com/macros/s/${key}/exec`;

export const environment = {
  production: false,
  scriptKey,
  token: 'MY_SECRET_KEY',
  defaultCycleStartDay: 25,
  apiUrl: buildApiUrl(scriptKey),
};
