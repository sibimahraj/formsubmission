import { useState } from "react"
import { useEffect } from "react"
import { Link } from 'react-router-dom';
import "./form.css"
import "./table.css"
import axios from "axios"
const Table = () => {
    const [data, setData] = useState([])
    useEffect(() => {
        axios.get("http://localhost:3000/users")
            .then((response) => setData(response.data))
            .catch((err) => console.log(err))


    }, [])

    const handleDelete = (id) => {
        const confirm = window.confirm("would you like to delete this employee details?")
        if (confirm) {
            axios.delete('http://localhost:3000/users/' + id)
                .then(res => {
                    window.location.reload();
                })
                .catch(err => console.log(err));
        }
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

                <div className="tablediv"><table className="wholetable">
                    <thead>
                        <tr>
                            <th className="hbg">EmpID</th>
                            <th className="hbg">Emp Name</th>
                            <th className="hbg">Department</th>
                            <th className="hbg">Company</th>
                            <th className="hbg">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((element, index) => (
                                <tr key={index} >
                                    <td className="bg">{element.id}</td>
                                    <td className="bg">{element.name}</td>
                                    <td className="bg">{element.department}</td>
                                    <td className="bg">{element.company}</td>
                                    <td><Link className="link lk1" to={`/read/${element.id}`} >Read</Link>
                                        <Link className="link lk2 lk4" to={`/update/${element.id}`} >Update</Link>
                                        <button className="link lk3 lk4" onClick={e => handleDelete(element.id)}>Delete</button>
                                        <Link className="link lk1 lk4" to={`/home`} >Back</Link>

                                    </td>

                                </tr>

                            ))
                        }

                    </tbody>
                </table>
                </div>


            </section>

        </>
    )
}
export default Table