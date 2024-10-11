const catList = document.getElementById('catList') as HTMLElement

// GET
const getCats = async () => {
  try {
    const response = await fetch(
      'https://api.thecatapi.com/v1/images/search?limit=9',
    )
    const cats = await response.json()
    return cats
  } catch (error) {
    console.log('고양이 목록 가져오기 실패', error)
  }
}

// 고양이 카드 띄우기
const createCatCard = async () => {
  const cats = await getCats()
  cats.slice(0, 9).forEach((cat: { url: string }) => {
    const catItem = document.createElement('div')
    const catImage = document.createElement('img')

    catItem.className =
      'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-30 md:w-60 md:h-60 border border-black hover:scale-105 transition-all'
    catImage.src = cat.url
    catImage.alt = '고양이 사진'
    catImage.className = 'w-full rounded-t-md h-20 md:h-40 object-cover'
    catItem.appendChild(catImage)
    catList?.appendChild(catItem)
  })
}

createCatCard()
