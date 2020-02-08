import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons' 
import PropTypes from 'prop-types'
import useKeyPress from '../Hooks/useKeyPress'

const FileList = ({files, onFileClick, onSaveEdit, onFileDelete}) => {
  const [editState, setEditState] = useState(false)
  const [value, setValue] = useState('')
  const [btnDisabled, setBtnDisabled] = useState(false)
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const node = useRef(null)
  useEffect(() => {
    const editItem = files.find(file => file.id === editState)
    if (enterPressed && editState && value.trim() !== '') {
      onSaveEdit(editItem.id, value, editItem.isNew)
      setEditState(false)
      setValue('')
    } else if (escPressed && editState) {
      closeEdit(editItem)
    }
    // eslint-disable-next-line
  }, [enterPressed, escPressed])
  useEffect(() => {
    if (editState) {
      node.current.focus()
    }
  }, [editState])
  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    // console.log(newFile)
    if (newFile) {
      setBtnDisabled(true)
      setEditState(newFile.id)
      setValue(newFile.title)
    }
    return () => {
      setBtnDisabled(false)
    }
  }, [files])
  const closeEdit = (editItem) => {
    setEditState(false)
    setValue('')
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }
  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li
            className="row list-group-item bg-light file-item d-flex cursor-hand mx-0"
            key={file.id}
          >
            { ((file.id !== editState) && !file.isNew) &&
              <>
                <span className="col-2">
                  <FontAwesomeIcon
                    icon={ faMarkdown } 
                  />
                </span>
                <span className="col-6" onClick={()=>{onFileClick(file.id)}}>{file.title}</span>
                <button
                    type="button"
                    className="icon-btn col-2"
                    onClick={() => {setEditState(file.id); setValue(file.title)}}
                    disabled={btnDisabled}
                >
                    <FontAwesomeIcon
                      icon={ faEdit } 
                    />
                </button>
                <button
                    type="button"
                    className="icon-btn col-2"
                    onClick={()=>{onFileDelete(file.id)}}
                    disabled={btnDisabled}
                >
                    <FontAwesomeIcon
                      icon={ faTrash } 
                    />
                </button>
              </>
            }
            { ((file.id === editState) || file.isNew) &&
              <>
                <input 
                  className="form-control col-10"
                  value={value}
                  onChange={(e) => {setValue(e.target.value)}}
                  ref={node}
                />
                <button
                  type="button"
                  className="icon-btn col-2"
                  onClick={() => {closeEdit(file)}}
                >
                  <FontAwesomeIcon
                    size="lg"
                    icon={ faTimes } 
                  />
                </button>
              </>
            }
          </li>
        ))
      }
    </ul>
  )
}
FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func
}
export default FileList