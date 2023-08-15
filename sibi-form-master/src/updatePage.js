import axios from "axios"
import "./form.css"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"


const Updatepage = () => {
    const { id } = useParams()
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
    useEffect(() => {
        axios.get('http://localhost:3000/users/' + id)
            .then(res => {
                setEmployesInfo(res.data);
            })
            .catch(err => console.log(err));

    }, [])
    const updateuser = (event) => {
        event.preventDefault();
        axios.put('http://localhost:3000/users/' + id, employesInfo)
            .then(res => {
                console.log(res);

                navigate('/table')
            })
            .catch(err => console.log(err));
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
                            <input value={employesInfo.id} onChange={employesInfo1} className="inp" placeholder="EmpID"></input>
                        </div>
                        <div className="ip1">
                            <input value={employesInfo.name} onChange={employesInfo2} className="inp" placeholder="Name"></input>
                        </div>
                        <div className="ip1">
                            <input value={employesInfo.department} onChange={employesInfo3} className="inp" placeholder="Department"></input>
                        </div>
                        <div className="ip1">
                            <input value={employesInfo.company} onChange={employesInfo4} className="inp" placeholder="Company"></input>
                        </div>
                        <div className="ip1">
                            <input onClick={updateuser} className="inp2" type="submit" value="Update"></input>
                        </div>

                    </div>
                </div>

            </section>




        </>
    )
}
export default Updatepage;