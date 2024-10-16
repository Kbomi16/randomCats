const API_URL = 'https://api.thecatapi.com/v1/images/search'
const loading = document.getElementById('loading') as HTMLElement

const itemsPerPage = 9

export const getCats = async (page: number) => {
  try {
    loading.classList.remove('hidden')
    const response = await fetch(
      `${API_URL}?limit=${itemsPerPage}&page=${page}`,
    )

    const cats = await response.json()
    return cats
  } catch (error) {
    console.log('고양이 목록 가져오기 실패', error)
  } finally {
    loading.classList.add('hidden')
  }
}
