import { Redirect, useParams } from 'react-router-dom'

const GuideRedir = () => {
    const { id } = useParams() as {id:string};
    return (<Redirect to={`/g/${id}`}/>);
}

export default GuideRedir;