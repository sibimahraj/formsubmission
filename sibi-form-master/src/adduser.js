import axios from "axios"
import "./form.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"


const Adduser = () => {
    const navigate = useNavigate()
    const [employesInfo, setEmployesInfo] = useState({
        id: '',
        name: "",
        department: "",
        company: ""
    })
    const employesInfo1 = (event) => {
        setEmployesInfo({ ...employesInfo, id: event.target.value })
    }
    const employesInfo2 = (event) => {
        setEmployesInfo({ ...employesInfo, name: event.target.value })
    }
    const employesInfo3 = (event) => {
        setEmployesInfo({ ...employesInfo, department: event.target.value })
    }
    const employesInfo4 = (event) => {
        setEmployesInfo({ ...employesInfo, company: event.target.value })

    }
    const postFunction = (event) => {
        event.preventDefault();
        axios.post("http://localhost:3000/users", employesInfo)
            .then((response) => console.log(response))
            .catch((error) => console.log(error))
        navigate(`/table`)


    }

    return (
        <>
            <section className="section">
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span> <span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span><span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span><span></span> <span></span> <span></span>
                <span></span> <span></span> <span></span><span></span> <span></span> <span></span>
                <div className="inputcontainer">
                    <div className="content">
                        <h2 className="h2">Emp Portal</h2>
                        <div className="ip1">
                            <input onChange={employesInfo1} className="inp" placeholder="EmpID"></input>
                        </div>
                        <div className="ip1">
                            <input onChange={employesInfo2} className="inp" placeholder="Name"></input>
                        </div>
                        <div className="ip1">
                            <input onChange={employesInfo3} className="inp" placeholder="Department"></input>
                        </div>
                        <div className="ip1">
                            <input onChange={employesInfo4} className="inp" placeholder="Company"></input>
                        </div>
                        <div className="ip1">
                            <input onClick={postFunction} className="inp2" type="submit" value="Submit"></input>
                        </div>

                    </div>
                </div>

            </section>




        </>
    )
}
export default Adduser