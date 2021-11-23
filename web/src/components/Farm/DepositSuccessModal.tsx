import React, { FC,useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

interface DepositSuccessModalProps {
  success: boolean
}
const DepositSuccessModal: FC<DepositSuccessModalProps> = ({success}) => {

  const clickModal = () => {
    console.log('trying to click')
    const element = document.querySelector('button[id="trigger"]');
    console.log('element', element)
    element.dispatchEvent(
      new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1
      })
    )
  }

  useEffect(() => {
    if (success) clickModal()
  }, [success])


return (
  <>
    <button style={{display: "none"}}  id="trigger" type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#depositSuccessModal"  >
    </button>

    <div className="modal fade" id="depositSuccessModal" tabIndex="-1" aria-labelledby="depositSuccessModal" aria-hidden="false">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="depositSuccessModal">Success!</h5>
            <button type="button" id="close" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="d-grid gap-2">
              <Link to='/portfolio'> 
                <button className="btn btn-outline-primary"  type="button" data-bs-dismiss="modal"
                >View In Portfolio</button>
              </Link>
            </div>
            <div className="text-center">
            </div>	
          </div>
        </div>
      </div>
    </div>
  </>
)
}

export default DepositSuccessModal
