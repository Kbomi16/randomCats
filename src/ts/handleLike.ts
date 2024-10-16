// 좋아요 누르기
const likeButton = document.getElementById('likeButton') as HTMLButtonElement

const likeCountDisplay = document.getElementById('likeCount') as HTMLElement
const filledHeart = likeButton.querySelector(
  'img[alt="채워진 하트"]',
) as HTMLImageElement
const emptyHeart = likeButton.querySelector(
  'img[alt="빈 하트"]',
) as HTMLImageElement

let likeCount = 0
let isLiked = false

export const handleLike = () => {
  likeButton.addEventListener('click', () => {
    isLiked = !isLiked

    if (isLiked) {
      likeCount += 1
      filledHeart.classList.remove('hidden')
      emptyHeart.classList.add('hidden')
    } else {
      likeCount -= 1
      filledHeart.classList.add('hidden')
      emptyHeart.classList.remove('hidden')
    }
    likeCountDisplay.textContent = likeCount.toString()
  })
}
