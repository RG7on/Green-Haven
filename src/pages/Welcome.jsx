import Button from '../components/common/Button'
import { Link } from 'react-router-dom'
import homeArt from '../assets/home_art_photo.png'

export default function Welcome() {
  return (
    <div className="center" style={{padding:'3rem 1rem'}}>
      <div className="stack" style={{maxWidth:480, textAlign:'center'}}>
        <img src={homeArt} alt="logo" style={{height:96, margin:'0 auto'}} />
        <h1 className="display" style={{fontSize:'2.6rem'}}>Greene Heaven</h1>
        <p>Your indoor jungle starts here – bring life, color, and calm into every corner of your home.</p>
        <div className="stack" style={{marginTop:'1rem'}}>
          <Link to="/login"><Button>Login</Button></Link>
          <Link to="/signup"><Button>Sign Up</Button></Link>
        </div>
      </div>
    </div>
  )
}
