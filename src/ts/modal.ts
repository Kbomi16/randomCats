const modal = document.getElementById('modal') as HTMLElement
const closeModalIcon = document.getElementById('closeModalIcon') as HTMLElement
const modalImage = document.getElementById('modalImage') as HTMLImageElement

export const openModal = (imageUrl: string, catId: string, tags: string[]) => {
  modalImage.src = imageUrl
  const modalTitle = document.querySelector('#modal h2') as HTMLElement
  modalTitle.textContent = `😺 ${catId} | ${tags[0]} 고양이`

  modal.classList.remove('hidden')
}

export const closeModal = () => {
  modal.classList.add('hidden')
}

closeModalIcon.onclick = closeModal
// modal: 모달배경이기 때문에 배경을 클릭한 경우 모달 닫기
modal.onclick = (e) => {
  if (e.target === modal) {
    closeModal()
  }
}
