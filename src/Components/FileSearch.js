import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons' 
import PropTypes from 'prop-types'
import useKeyPress from '../Hooks/useKeyPress'

const FileSearch = ({ title, btnDisabled, onFileSearch }) => {
    const [ inputActive, setInputActive ] = useState(false)
    const [ value, setValue ] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    const closeSearch = () => {
        setInputActive(false)
        setValue('')
        onFileSearch(' ')
    }
    const node = useRef(null) 
    useEffect(() => {
        if (enterPressed && inputActive) {
            onFileSearch(value)
        }
        if(escPressed && inputActive) {
            closeSearch()
        }
        // eslint-disable-next-line
    }, [enterPressed, escPressed, inputActive])
    useEffect(() => {
        if (inputActive) {
            node.current.focus()
        }
    }, [inputActive])
    return (
        <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
            { !inputActive &&
                <>
                    <span className="line-height">{title}</span>
                    <button
                        type="button"
                        className="icon-btn"
                        disabled={btnDisabled}
                        onClick={() => {setInputActive(true)}}
                    >
                        <FontAwesomeIcon
                            size="lg"
                            icon={ faSearch } 
                        />
                    </button>  
                </>
            }
            {
                inputActive &&
                <>
                    <input 
                        className="form-control"
                        value={value}
                        onChange={(e) => {setValue(e.target.value)}}
                        ref={node}
                    />
                    <button
                        type="button"
                        className="icon-btn ml-2"
                        onClick={closeSearch}
                    >
                        <FontAwesomeIcon
                            size="lg"
                            icon={ faTimes } 
                        />
                    </button>
                </> 
            }
        </div>
    )
}
FileSearch.propTypes = {
    title: PropTypes.string,
    onFileSearch: PropTypes.func.isRequired
}
FileSearch.defaultProps = {
    title: '我的云文档'
}
export default FileSearch