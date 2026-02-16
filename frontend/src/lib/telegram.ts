declare global {
  interface Window {
    Telegram?: { WebApp: any };
  }
}

const DEV_TELEGRAM_ID = import.meta.env.VITE_DEV_TELEGRAM_ID;

export const getTelegramId = (): string | null => {
  const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
  if (telegramId) {
    return telegramId;
  }

  if (DEV_TELEGRAM_ID) {
    return String(DEV_TELEGRAM_ID);
  }

  return null;
};
