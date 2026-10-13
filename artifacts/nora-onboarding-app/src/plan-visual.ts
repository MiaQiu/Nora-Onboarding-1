export function getPlanVisual(gender: string) {
  if (gender === 'girl') {
    return {
      file: 'nora-girl-before-after.jpg',
      alt: 'Illustrated goal: a girl upset at the end of screen time, followed by the same girl calmly putting the tablet away with a supportive parent.',
    };
  }
  if (gender === 'boy') {
    return {
      file: 'nora-two-month-before-after.jpg',
      alt: 'Illustrated goal: a boy upset at the end of screen time, followed by the same boy calmly putting the tablet away with a supportive parent.',
    };
  }
  return null;
}
