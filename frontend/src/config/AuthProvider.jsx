import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [datas, setDatas] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchData, setWatchData] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                setUser({ email: storedUser.replace(/"/g, "") });
            }
        }
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        return Promise.resolve();
    };

    const data = {
        datas,
        loading,
        user,
        setUser,
        setDatas,
        logout,
        watchData,
        setWatchData
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;