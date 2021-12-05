import React, { FC, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from 'mdb-react-ui-kit';
import { MDBCard, MDBCardTitle, MDBCardText, MDBCardOverlay, MDBCardImage  } from 'mdb-react-ui-kit';

interface DepositSuccessModalProps {
  success: boolean
}
const DepositSuccessModal: FC<DepositSuccessModalProps> = ({success}) => {
  const [basicModal, setBasicModal] = useState(false);
  const toggleShow = useCallback(() => {
   setBasicModal(!basicModal)
  }, [basicModal]);
  
  useEffect(() => {
    if (success) setBasicModal(true)
    
  }, [success])

return (
  <>
  <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
    <MDBModalDialog>
      <MDBModalContent>
        <MDBModalHeader>
          <MDBModalTitle>Success!</MDBModalTitle>
          <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
        </MDBModalHeader>
        <MDBModalBody>
          <MDBBtn href="/portfolio">View In Portfolio</MDBBtn>
        </MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color='secondary' onClick={toggleShow}>
            Close
          </MDBBtn>
        </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  </>
)
}

export default DepositSuccessModal

/*
 *
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

 */
