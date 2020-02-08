import React , {useState} from 'react'
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './Components/FileSearch'
import FileList from './Components/FileList'
import BottomBtn from './Components/Button'
import TabList from './Components/TabList'
import SimmpleMDE from 'react-simplemde-editor'
import uuidv4 from 'uuid/v4'
import { flatterArr, objToArr } from './Utils/tool'
import "easymde/dist/easymde.min.css"
import fileTool from './Utils/fileTool'
const { join, basename, extname, dirname } = window.require('path')
const { remote } = window.require('electron')
const Store = window.require('electron-store')

const store = new Store({name: 'fileData'})
const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file)=>{
    const {id, path, title, createAt } = file
    result[id] = {
      id,
      path,
      title,
      createAt
    }
    return result
  }, {})
  store.set('files', filesStoreObj)
}


function App() {
  const [ files, setFiles ] = useState(store.get('files') || {})
  const [ activeFileID, setActiveFileID ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [ searchedFiles, setSearchedFiles ] = useState([])
  const [ btnDisabled, setBtndisabled ] = useState(false)
  const filesArr = objToArr(files)
  const savedLocation = remote.app.getPath('documents')
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
  const fileClick = (fileID) => {
    setActiveFileID(fileID)
    const currentFile = files[fileID]
    if(!currentFile.isLoaded){
      fileTool.readFile(currentFile.path).then(value => {
        const newFile = {...files[fileID], body: value, isLoaded: true}
        setFiles({...files, [fileID]: newFile})
      }, ()=>{
        remote.dialog.showMessageBox({
          type: 'error',
          title: '文件路径不存在',
          message: '文件已被删除或路径发生了变化'
        }).then(()=>{
          delete files[fileID]
          setFiles({...files})
          saveFilesToStore(files)
        })
      })
    }
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
  }
  const tabClose = (fileID) => {
    const newTabs = openedFileIDs.filter(id => id!==fileID)
    setOpenedFileIDs(newTabs)
    if (newTabs.length) {
      setActiveFileID(newTabs[newTabs.length-1])
    } else {
      setActiveFileID('')
    }
  }
  const tabClick = (fileID) => {
    setActiveFileID(fileID)
  }
  const fileChange = (id, value) => {
    const newFile = {...files[id], body: value}
    setFiles({...files, [id]: newFile})
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }
  const deleteFile = (fileID) => {
    if (files[fileID].isNew) {
      delete files[fileID]
      setFiles(files)
      setBtndisabled(false)
    } else {
      fileTool.deleteFile(files[fileID].path).then(()=>{
        delete files[fileID]
        setFiles(files)
        saveFilesToStore(files)
        tabClose(fileID)
        setBtndisabled(false)
      },()=>{
        delete files[fileID]
        setFiles(files)
        saveFilesToStore(files)
        tabClose(fileID)
        setBtndisabled(false)
      })
    }
  }
  const updateFileName = (fileID, title, isNew) => {
    const flag = objToArr(files).some(file=>{
      if(file.title===title){
        remote.dialog.showMessageBox({
          type: 'error',
          title: '文件重名',
          message: '请重新输入'
        })
        return true
      }
    })
    if(!flag){
      const newPath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[fileID].path), `${title}.md`)
      const modifiedFile = {...files[fileID], title, isNew: false, path: newPath}
      const newFiles = {...files, [fileID]: modifiedFile}
      // console.log(modifiedFile)
      if (isNew) {
        fileTool.writeFile(newPath, files[fileID].body)
      } else {
        fileTool.renameFile(files[fileID].path, newPath).then(()=>{
        }, ()=>{
          remote.dialog.showMessageBox({
            type: 'error',
            title: '文件路径不存在',
            message: '文件已被删除或路径发生了变化'
          }).then(()=>{
            delete files[fileID]
            setFiles({...files})
            saveFilesToStore(files)
          })
        })
      }
      setFiles(newFiles)
      saveFilesToStore(newFiles)
      setBtndisabled(false)
    }
  }
  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }
  const createNewFile = () => {
    setBtndisabled(true)
    const newID = uuidv4()
    const newFile = {
      id: newID,
      title: '',
      body: '',
      createAt: new Date().getTime(),
      isNew: true
    }
    setFiles({...files, [newID]: newFile})
  }
  const activeFile = files[activeFileID]
  const saveCurrentFile = () => {
    fileTool.writeFile(activeFile.path, activeFile.body).then(
      setUnsavedFileIDs(unsavedFileIDs.filter((id)=>id !== activeFileID))
    )
  }
  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'MarkDown', extensions: ['md']}
      ]
    }).then(res=>{
      if(!res.cancel){
        const filteredPaths = res.filePaths.filter(path => {
          const alreadyAdded = Object.values(files).find(file=>{
            return file.path===path
          })
          return !alreadyAdded
        })
        const importFilesArr = filteredPaths.map(path=>{
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path,
            createAt: new Date()
          }
        })
        const newFiles = {...files, ...flatterArr(importFilesArr)}
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      }
    })
  }
  return (
    <div className="container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 left-panel">
          <FileSearch
            title='我的文档'
            btnDisabled={btnDisabled}
            onFileSearch={(value) => {fileSearch(value)}}
          />
          <FileList
            files={searchedFiles.length ? searchedFiles : filesArr}
            onFileClick={(id)=>{fileClick(id)}}
            onFileDelete={(id)=>{deleteFile(id)}}
            onSaveEdit={(id, newVal, isNew)=>{updateFileName(id, newVal, isNew)}}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-info"
                icon={faPlus}
                btnDisabled={btnDisabled}
                onBtnClick={createNewFile}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          { !activeFile && 
            <div className="start-page">
              创建您的Markdown
            </div>
          }
          { activeFile &&
            <>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveId={unsavedFileIDs}
                onTabClick={(id) => {tabClick(id)}}
                onCloseClick={(id) => {tabClose(id)}}
              />
              <SimmpleMDE
                key={activeFile && activeFileID}
                value={activeFile && activeFile.body}
                onChange={(value) => {fileChange(activeFileID, value)}}
                options={{
                  minHeight: '71.5vh'
                }}
              />
              <BottomBtn
                text="保存"
                colorClass="btn-primary"
                icon={faSave}
                onBtnClick={saveCurrentFile}
              />
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
