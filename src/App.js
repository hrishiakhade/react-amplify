import './App.css';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/api';
import config from './amplifyconfiguration.json';
import { listTodos } from './graphql/queries';
import { createTodo, updateTodo, deleteTodo } from './graphql/mutations';
import { useState } from 'react';
Amplify.configure(config);


export default function App() {
  const client = generateClient();
  const [data, setData] = useState([]);

  const fetchRecord = async () => {
    try {
      const Data = await client.graphql({
        query: listTodos
      })
      setData(Data.data.listTodos.items)
    } catch (error) {
      console.log("Error while fetchRecord ", error);
    }
  }

  const addRecord = async () => {
    try {
      const result = await client.graphql({
        query: createTodo,
        variables: {
          input: {
            name: 'My first todo!',
            id: '1',
            filepath: "WTF that",
            like: 5,
            owner: "Hrushi"
          }
        }
      });

      console.log(result);
      setData(prevData => [...prevData, result.data.createTodo]);

    } catch (error) {
      console.log("Error while adding ", error);
    }
  }

  const handleClick = async (isAdd, itemId, number) => {
    const index = data.findIndex(item => item.id == itemId);
    try {
      const updatedData = await client.graphql({
        query: updateTodo,
        variables: {
          input: {
            id: itemId,
            like: isAdd ? number + 1 : number - 1
          }
        }
      })

      const dataCopy = [...data];
      dataCopy[index] = updatedData.data.updateTodo;
      setData(dataCopy);
    } catch (error) {
      console.log("Error...", error);
    }
  }

  const handleDelete = async (itemId) => {
    try {
      const result = await client.graphql({
        query: deleteTodo,
        variables: {
          input: {
            id: itemId
          }
        }
      });
      const index = data.findIndex(item => item.id == itemId);
      const dataCopy = [...data];
      delete dataCopy[index];
      setData(dataCopy);

      console.log("result==", result);
    } catch (error) {
      console.log("Error...", error);
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user.signInDetails.loginId}</h1>
          <h1>User ID {user.userId}</h1>

          <button onClick={addRecord}> Add a record </button>
          <button onClick={fetchRecord}>Fetch records</button>
          <button onClick={signOut}>Sign out</button>
          <>
            {data.map(item =>
              <div style={{ background: 'green', margin: '0.5rem' }} key={item.id}>
                <p>Name : {item.name}</p>
                <p>Owner : {item.owner}</p>
                <div style={{ flexDirection: 'row', display: 'flex' }}>
                  <p>Likes : {item.like}</p>
                  <button onClick={() => handleClick(true, item.id, item.like)}>+</button>
                  <button onClick={() => handleClick(false, item.id, item.like)} disabled={item.like == 0}>-</button>
                </div>
                <button onClick={() => handleDelete(item.id)}>Delete this shit</button>
              </div>
            )}
          </>
        </main>
      )}
    </Authenticator>
  );
}

