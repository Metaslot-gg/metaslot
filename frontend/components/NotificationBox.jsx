import React, { useState } from "react"
import * as SVGIcon from './icons/SvgIcons'
const _ = require('lodash')

export function NotificationBox(props) {
  const { msg, role, className, handleClose } = props
  return (
    <div className={className} role={role} >
        <div className="flex">
          <div>
           <SVGIcon.CircledInfo />
          </div>
          <div>
            <p className="font-bold">Your play is in process.</p>
            <p className="text-sm">{msg}</p>
          </div>
        </div>
      </div>
  )
}