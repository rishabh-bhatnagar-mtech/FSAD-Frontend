import React, { useState } from 'react';

const useAuth = () => {
    const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('loggedIn') === 'true');
    const login = (username, password) => {
        if (username === 'admin' && password === 'password') {
            localStorage.setItem('loggedIn', 'true');
            setLoggedIn(true);
            return true;
        }
        return false;
    };
    return { loggedIn, login };
};

const AuthGate = ({ children }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loggedIn, login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!login(username, password)) {
            setError('Invalid credentials');
        }
    };

    if (loggedIn) return children;

    return (
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
            <form onSubmit={handleSubmit} style={{padding:24,boxShadow:'0 0 10px #ccc',borderRadius:8,background:'#fff',minWidth:300}}>
                <h2>Login</h2>
                <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} style={{width:'100%',marginBottom:12,padding:8}}/>
                <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',marginBottom:12,padding:8}}/>
                <button type="submit" style={{width:'100%',padding:8}}>Login</button>
                {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
            </form>
        </div>
    );
};

export default AuthGate;
