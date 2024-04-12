import React from 'react'
import './App.css'
import axios from 'axios'

type ActiveState = {
  status: boolean,
  data?: {
    "start_at": number,
    "last_ping": number
  }
}

type Runtimes = {
  id: number,
  user: number,
  start: number,
  stop: number
}[]

function getTimeDifference(date1:number, date2: number) {
  // Calculate the difference in milliseconds
  const differenceMs = Math.abs(date2 - date1);

  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(differenceMs / (1000 * 60 * 60));
  const minutes = Math.floor((differenceMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((differenceMs % (1000 * 60)) / 1000);

  // Format the time difference
  const formattedTime = ` ${padZero(hours)} : ${padZero(minutes)} : ${padZero(seconds)} `;

  return formattedTime;
}

// Helper function to pad single digits with leading zeros
function padZero(num: number) {
  return num < 10 ? `0${num}` : num;
}

const loadCount = 10;
const routes = ["https://pumpruntime.onrender.com"]
const mode: 'ONLINE' | 'OFFLINE' = 'ONLINE';
const route = 0;
const device = 0

function App() {
  const [activeState, setActiveState] = React.useState<ActiveState>({status: false});
  // const [activeState, setActiveState] = React.useState<ActiveState>({status: true, data: {start_at: new Date().getTime(), last_ping: new Date().getTime()+1000000}});
  // const [device, setDevice] = React.useState<number>(0);
  const [startRuntime, setStartRuntime] = React.useState<number>(0);
  const [runtimes, setRuntimes] = React.useState<Runtimes>([]);
  const [currentTime, setCurrentTime] = React.useState(0);

  const axiosGet = async (url: string, params: undefined | {[key: string]: number}) => {
    const data = await axios.get(`${routes[route]}${url}`, {params: params, withCredentials: false});
    return data.data;
  }

  const getLogs = async () => {
    const res = await axiosGet('/history', {device, offset: startRuntime, count: loadCount, t: new Date().getTime()});
    console.log(res)
    if(res.length){
      setRuntimes(prev=>([...prev, ...res]));
      setStartRuntime(prev=>prev+loadCount);
    }
  }

  const getActiveStatus =  async () => {
    const rt = await axiosGet('/active', {device, t: new Date().getTime()});
    setActiveState(rt);
  }

  React.useEffect(()=> {
    const interval = setInterval(getActiveStatus, 2500);
    const timeInterval = setInterval(()=>setCurrentTime(new Date().getTime()), 1000)
    return ()=>{
      clearInterval(interval);
      clearInterval(timeInterval);
    }
  }, [])

  React.useEffect(()=>{
    setStartRuntime(0);
    setRuntimes([]);
    getActiveStatus();
    getLogs();
  }, [device, route])

  return (
    <>
      <div className="row border border-secondary">
        <div className="col-12 border-box text-center">
          <h3>Runtime</h3>
        </div>
      </div>
      {/* <div className="row">
        <div className="col">
          Device: 
          <input type="number" name="number" id="nb" className='half p-2 form-control' onChange={e=>setDevice(Number(e.target.value))} value={device} />
          <button className='btn btn-outline-danger'>Change device</button>
          
        </div>
      </div> */}
      <div className="row py-3">
        <div className="col-12">
        {mode == 'OFFLINE' ? 
            <a className="btn btn-primary me-4" id='0' href={routes[0]}>
              Go Online
            </a>
            :
            <a className="btn btn-primary" id='1' href={routes[1]}>
              Go Wifi
            </a>
        }
        </div>
      </div>
      <hr />
      <div className="row">
        <h2>Active:</h2>
        {
          activeState.status?
            <div className="col">
              <h2 className="text-success">Running</h2>
              <span className='btn btn-outline-success mb-2'>{getTimeDifference(activeState.data?.start_at||0, currentTime)}</span>
              <h5>Started: {new Date(activeState.data?.start_at || new Date().getTime()).toLocaleTimeString()}</h5>
            </div>
            :
              <div className="col">
                <h2 className="text-danger">No</h2>
              </div>
        }
        <hr />
      </div>
        <div className="row">
          <div className="col">
            <h3>Logs</h3>
          </div>
        </div>
        <div className="row">
          <div className="col border border-dark">
            {
              runtimes.length? 
                runtimes.map(entry=>{
                  const t1 = new Date(entry.start);
                  return <div className="p-2 border border-grey" key={entry.id}>
                    <div className='py-1'><span className='btn btn-outline-success'>{getTimeDifference(entry.start, entry.stop)}</span> {t1.toLocaleTimeString('en-in', {hour12: true})} <b>-{'>'}</b> {new Date(entry.stop).toLocaleTimeString('en-in', {hour12: true})} <span className='text-body-secondary'>({t1.toLocaleDateString('en-in', {month: 'short', day: '2-digit'})})</span></div>
                  </div>
                }
                )
              :
                <div className='text-center'>No data</div>
            }
        </div>
      </div>
      <div className="row">
        <div className="col">
          <button type="button" className='btn btn-danger' onClick={getLogs}>Load</button>
        </div>
      </div>
    </>
  )
}

export default App
