import React, { FC, useState } from 'react'
import { injected } from '../connectors'
import { useWeb3React } from '@web3-react/core'
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

const WalletModal: FC = () => {
  const context = useWeb3React()
  const { connector, activate, account } = context

  const [activatingConnector, setActivatingConnector] = React.useState()

  const [basicModal, setBasicModal] = useState(false);

  const toggleShow = () => setBasicModal(!basicModal);
  return (
    <>
    <MDBBtn
      className={"text-nowrap" + (account ? ' disabled': '')}
      outline 
      rounded 
      onClick={toggleShow} color={account ? 'info': 'warning'}>
      {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
    </MDBBtn> 
  <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
    <MDBModalDialog>
      <MDBModalContent>
        <MDBModalHeader>
          <MDBModalTitle>ConnectWallet</MDBModalTitle>
          <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
        </MDBModalHeader>
        <MDBModalBody>
          <MDBBtn color="light" onClick={() => {
              setActivatingConnector(injected)
              activate(injected)
              toggleShow()
            }}>

					<MDBCard background='dark' className='text-white'>
						<MDBCardImage overlay src='images/metamask.png' />
					</MDBCard>

          </MDBBtn>	
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


export default WalletModal

