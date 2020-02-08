import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons' 

import './TabList.scss'

const TabList = ({files, activeId, unsaveId, onTabClick, onCloseClick}) => {
  return (
    <ul className="nav nav-pills tablist-component">
      {files.map(file => {
        const withUnsavedMark = unsaveId.includes(file.id)
        const fClassName = classNames({
          'active': file.id === activeId,
          'withUnsaved': withUnsavedMark,
          'nav-link': true,
          'a-color': true
        })
        return (
          <li className="nav-item cursor-hand" key={file.id}>
            <a
              href="#"
              className={fClassName}
              onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
            >
              {file.title}
              <span
                className="ml-2 close-icon"
                onClick={(e)=>{e.stopPropagation(); onCloseClick(file.id)}}
              >
                <FontAwesomeIcon
                  icon={ faTimes } 
                />
              </span>
              { withUnsavedMark && <span className="rounded-circle unsaved-icon ml-2"/>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unsaveId: PropTypes.array,
  onCloseClick: PropTypes.func,
  onTabClick: PropTypes.func
}
TabList.defaultProps = {
  unsaveId: []
}
export default TabList