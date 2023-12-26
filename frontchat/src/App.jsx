import React,{ useState, useEffect } from 'react'
import axios from 'axios'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CgProfile } from "react-icons/cg";
import { GrRobot } from "react-icons/gr";


import copy from 'copy-to-clipboard';
import './App.less'
// this is where i leave you

function App() {
  const [data, setData] = useState([{}])
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState([]);

  const chara = "To update data in a SQL database, you can use the UPDATE statement. Here's an example of a query that updates a specific row in a table: ```sql UPDATE your_table_name SET column1 = value1, column2 = value2, ... WHERE condition; ```  ```sql DELETE your_table_name SET column1 = value1, column2 = value2, ... WHERE condition; ```  Replace `your_table_name` with the name of your table, `column1`, `column2`, etc. with the names of the columns you want to update, and `value1`, `value2`, etc. with the new values you want to set for those columns. The `WHERE` clause is optional but can be used to update only specific rows that meet certain conditions. If not specified, all rows in the table will be updated. Make sure to customize the query according to your specific database schema and requirements."

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (xx) => {
    copy(xx);
    setIsCopied(true);
  };

  const calling = async() => {
    const response = await axios.get("http://localhost:5000/members")
    setData(response.data)
    console.log("response", response)
  }

  useEffect(() =>{
    calling()
  },[])

  const callingPost = async () => {
    try {
      const response = await axios.post("http://localhost:5000/chat", {
        question: input
      });
      console.log("response", response.data);
    } catch (error) {
      console.error("Error:", error.response.data);
    }
  };

  const handler = (event) => {
    if (event.keyCode === 13) {      
      handleChatInput();
    }
  };

  function handleChatInput() {
    const data = { sender: "user", text: input };
    if (input !== "") {
      setChatHistory((history) => [...history, data]);
      chatWithOpenai(input);    
      setInput("");  
    }
  }

  async function chatWithOpenai(text) {
    const requestOptions = {
        question: text,
        // context: JSON.stringify(context),
        // behavior: JSON.stringify(behavior),
    };

   const apiUrl = "http://localhost:5000/chat";
    const response = await axios.post(apiUrl, requestOptions)
    const data = {
      sender: "bot",
      text: response.data.answer,
      // userId: session?.user?.id,
    };
     setChatHistory((history) => [...history, data]);
     setInput("");
    // saveChat(data);
    // setIsLoading(false);
  }
 
  console.log("for month", chatHistory)

  const splitAnswerParts = (answer) => {
    const parts = [];
    const codeRegex = /```sql([\s\S]*?)```/g;
  
    let match;
    let lastIndex = 0;
  
    while ((match = codeRegex.exec(answer))) {
      const codeContent = match[1].trim();
  
      if (match.index > lastIndex) {
        const textContent = answer.substring(lastIndex, match.index).trim();
        parts.push({ type: 'text', content: textContent });
      }
  
      parts.push({ type: 'code', content: codeContent });
  
      lastIndex = match.index + match[0].length;
    }
  
    if (lastIndex < answer.length) {
      const textContent = answer.substring(lastIndex).trim();
      parts.push({ type: 'text', content: textContent });
    }
  
    return parts;
  };
  
  const answerParts = splitAnswerParts(chara);

  return (
    <>
      {/* <div>        
        <div className="container">
          <SyntaxHighlighter language="javascript" style={dark}>
            {chara}
          </SyntaxHighlighter>
        </div>
        <button onClick={handleCopy}>
          {isCopied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div> */}
      
    <div>
      {answerParts.map((part, index) => (
        <React.Fragment key={index}>
          {part.type === 'code' ? (
            <div className="code-block">
              <SyntaxHighlighter language="sql" style={docco}>
                {part.content}
              </SyntaxHighlighter>
              <button onClick={()=>handleCopy(part.content)}>
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          ) : (
            <p>{part.content}</p>
          )}
        </React.Fragment>
      ))}
     
    </div>

      {open?
      <div className='chatcontainer'>
        <div>
            <div className='headbox'>
              <p>query, visualize with AI</p>            
              <img alt="charimage" src="./des.png" className="avatar" />           
            </div>

            <div className='chatbox'>
              {chatHistory.map((chat, index) => (
                  <div key={index} className="chatcontain ">
                    {chat.sender === "user" ? (
                      <>
                        <div className="user">
                          <div className="">
                            <p className="parauser">{chat?.text}</p>
                          </div>
                        </div>
                
                      </>
                    ) : (
                      <>
                        <div className='ai'>
                            <div className="">
                              <p className="parai">{chat?.text}</p>
                            </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>

            <div className='inputbox'>        
              <input             
                  className="input"    
                  type="text"
                  value={input}
                  placeholder="Type your message…"
                  onChange={(e) => setInput(e.target.value)}
                  // onClick={callingPost}
                  onKeyDown={(e) => handler(e)}
              />
            </div>
        </div>
      </div>
      :null}

      <div className='iconbox' onClick={()=>setOpen(!open)}>
         <img alt="charimage" src="./redashpng.png" className="icon" />
      </div>

     
    </>
  )
}

export default App
