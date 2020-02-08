import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'

const BottomBtn = ({ text, colorClass, icon, btnDisabled ,onBtnClick }) => (
  <button
    type="button"
    className={`btn btn-block no-border ${colorClass}` }
    onClick={onBtnClick}
    disabled={btnDisabled}
  >
    <FontAwesomeIcon
      className="mr-2"
      icon={ icon } 
    />
    {text}
  </button>
)

BottomBtn.propTypes = {
  text: PropTypes.string,
  colorClass: PropTypes.string,
  icon: PropTypes.object.isRequired,
  onBtnClick: PropTypes.func
}

export default BottomBtn