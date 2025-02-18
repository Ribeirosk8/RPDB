import '../../styles/globals.css';
import React from 'react'

const SectionOneLayout = ({
    children,
  }: {
    children: React.ReactNode
  }) => {
  return (
    <>
        {/* <div>Header</div> */}
        {children}
        {/* <div>Footer</div> */}
    </>
  )
}

export default SectionOneLayout