export const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${Math.floor(remainingSeconds)
    .toString()
    .padStart(2, "0")}`;
};
