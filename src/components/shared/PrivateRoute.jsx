import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
export default function PrivateRoute(props){
    const {data} = useSelector((state)=>{
        return state.user
    })
    if(localStorage.getItem("token") && data){
        return props.children
    } else if(localStorage.getItem("token") && !data){
        return false
    }
    else {
        return <Navigate to="/login"/>
    }
}