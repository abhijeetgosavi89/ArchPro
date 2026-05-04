
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.top}>
                    <div>
                        <h3>ARCH<span>PRO</span></h3>
                        <p>Your trusted source for quality house plans.</p>
                    </div>
                    <div>
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Contact</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Collections</h4>
                        <ul>
                            <li><a href="#">Modern</a></li>
                            <li><a href="#">Farmhouse</a></li>
                            <li><a href="#">Trending</a></li>
                        </ul>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} ArchPro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
