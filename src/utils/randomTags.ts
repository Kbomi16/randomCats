// 무작위 태그 생성 함수
export const randomTags = (count: number): string[] => {
  const exampleTags = [
    '귀여운',
    '재미있는',
    '장난스러운',
    '졸린',
    '털북숭이',
    '사랑스러운',
  ]
  const randomTags: string[] = []

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * exampleTags.length)
    randomTags.push(exampleTags[randomIndex])
  }
  return Array.from(new Set(randomTags))
}
