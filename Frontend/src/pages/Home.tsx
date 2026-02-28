import {Link} from 'react-router-dom'


export function Home(){
    return(
        <>

            <h1>Welcome to Qurio!</h1>   
            {/* <Link to="/">Home</Link> */}
            <Link to="/UpdatePersonalInformation">Update Personal Information</Link>     
        </>
    )
}