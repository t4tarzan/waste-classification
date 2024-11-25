import { useState } from 'react'

const TestComponent = (): JSX.Element => {
  const [count, setCount] = useState(0)

  const handleClick = (): void => {
    setCount(count + 1)
  }

  return (
    <div>
      <h1>Test Component</h1>
      <p>Count: {count}</p>
      <button onClick={handleClick}>
        Increment
      </button>
    </div>
  )
}

export default TestComponent
