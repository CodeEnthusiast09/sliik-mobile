export const getGreeting = (fullName?: string | null): string => {
  const hour = new Date().getHours();

  let greeting = 'Hello';

  if (hour < 12) {
    greeting = 'Good morning';
  } else if (hour < 17) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }

  const firstName = fullName?.trim().split(' ')[0];

  return firstName
    ? `${greeting}, ${firstName} 👋`
    : `${greeting} 👋`;
}
