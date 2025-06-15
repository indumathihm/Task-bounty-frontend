import { useSelector } from "react-redux"
import {Navigate} from "react-router-dom"
export default function  ProtectedRoute(props){
    const {data}=useSelector((state)=>{
   return  state.user
})
    if(props.roles.includes(data.role)){
        return props.children
    }
    else if(!data.role){
        return false
    }
    else{
        return<Navigate to="/unauthorized"/>
    }
}