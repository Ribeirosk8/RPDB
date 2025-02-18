import '../../styles/globals.css';
import React from 'react'

const SpecialLayout = ({
    children,
  }: {
    children: React.ReactNode
  }) => {
  return (
    <>{children}</>
  )
}

export default SpecialLayout