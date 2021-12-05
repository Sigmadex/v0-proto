import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import WalletModal from './WalletModal.tsx'
import NetworkModal from './NetworkModal.tsx'

import {
    MDBContainer,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarToggler,
    MDBIcon,
    MDBNavbarNav,
    MDBNavbarItem,
    MDBNavbarLink,
    MDBBtn,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
    MDBDropdownLink,
    MDBCollapse
  
} from 'mdb-react-ui-kit';
const NavBar: React.FC = () => {
  const [showBasic, setShowBasic] = useState(false);

  return (
    <MDBNavbar expand='lg' light bgColor='light'>
      <MDBContainer fluid>
        <MDBNavbarBrand href='/'>
          <img
            src="https://i.imgur.com/L7rAsEe.png"
            height='33'
            alt=''
            loading='lazy'
          />
        </MDBNavbarBrand>
        <MDBNavbarToggler
          aria-controls='navbarSupportedContent'
          aria-expanded='false'
          aria-label='Toggle navigation'
          onClick={() => setShowBasic(!showBasic)}
        >
          <MDBIcon icon='bars' fas />
        </MDBNavbarToggler>

        <MDBCollapse navbar show={showBasic}>
          <MDBNavbarNav className='mr-auto mb-2 mb-lg-0'>
            <MDBNavbarItem>
              <MDBNavbarLink disabled href='/swap'>
                Swap
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink disabled href='/pool'>
                Pool
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink href='/farms'>
                Farm
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink href='/portfolio'>Portfolio</MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink disabled href='#' aria-disabled="true">About</MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink disabled href='#' tabIndex={-1} aria-disabled='true'>
                Governance
              </MDBNavbarLink>
            </MDBNavbarItem>
          </MDBNavbarNav>

          <div className='d-flex justify-content-around'>
            <div className="p-2"><NetworkModal/></div>
            <div className="p-2"><WalletModal/></div>
          </div>
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>

    
  )
}

export default NavBar

