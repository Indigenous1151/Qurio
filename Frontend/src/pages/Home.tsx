import {Link} from 'react-router-dom'


export function Home(){
    return(
        <>

            <h1>Welcome to Qurio!</h1>   
            {/* <Link to="/">Home</Link> */}
            <p><Link to="/UpdatePersonalInformation">Update Personal Information</Link></p>  
            <p><Link to="/create-account">Create Account</Link></p>
            <p><Link to="/sign-in">Sign In</Link></p>
            <p><Link to="/forgot-password">Forgot Password</Link></p>
        </>
    )
}