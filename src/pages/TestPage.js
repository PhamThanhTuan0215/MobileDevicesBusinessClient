import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const TestPage = () => {

    const navigate = useNavigate();

    useEffect(() => {

        localStorage.clear();

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }, [navigate]);

    return (
        <div style={styles.container}>
            <h2>Logging out...</h2>
        </div>
    );

}

const styles = {
    container: {
        textAlign: "center",
        marginTop: "50px",
        fontSize: "18px",
    },
};