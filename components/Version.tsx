import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';


export const Version = () => {
  return (
    <div className='order-1 md:order-3 ml-auto text-xs text-gray-400 mr-2 cursor-pointer'>
          <Tooltip>
            <TooltipTrigger asChild >
              <div className=''>
                v1.0.0-alpha
              </div>
            </TooltipTrigger>
            <TooltipContent>Web app currently in alpha mode,&nbsp;&nbsp;may contain bugs and errors</TooltipContent>
          </Tooltip>
    </div>
  )
}

export default Version