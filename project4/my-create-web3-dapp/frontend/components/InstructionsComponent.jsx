import { use, useEffect, useState } from "react";
import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";
import { useBalance, useNetwork, useSigner } from "wagmi";

export default function InstructionsComponent() {
	const router = useRouter();
	return (
		<div className={styles.container}>
			<PageTitle/>
			<PageBody/>
			<PageFooter/>
		</div>
	);
}

function PageTitle(){
	return (
		<>
			<header className={styles.header_container}>
				<h1>
					My dApp
				</h1>
				<p>
					My custom dAPP
				</p>
			</header>
		</>
	)
}

function PageBody(){
	return (
		<>
			<div className={styles.buttons_container}>
				<ApiInfo/>
				<WalletInfo/>
				<RequestTokens></RequestTokens>
				<Delegate></Delegate>
				<Vote></Vote>
				<Result></Result>
			</div>
		</>
	)
}

function ApiInfo() {
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	useEffect(() =>{
		setLoading(true);
		fetch('https://random-data-api.com/api/v2/users')
		.then((res)=> res.json())
		.then((data) =>{
			setData(data);
			setLoading(false);
		});
	}, []);

	if (isLoading) return <p>Loading...</p>
	if (!data) return <p>no data</p>

	return (
		<div>
			<h1>{data.username}</h1>
			<p>{data.email}</p>
		</div>
	)
}

function WalletInfo(){
	const {data: signer, isError, isLoading} = useSigner();
	const {chain,chains} = useNetwork();
	if (signer) return(
		<>
			<p>Your account address is {signer._address}</p>
			<p>Connected to the {chain.name} network</p>
			<button onClick={() =>signTransaction(signer)}>Sign</button>
			<WalletBalance></WalletBalance>
		</>
	)
	else if (isLoading) return(
		<p>Loading...</p>
	)
	else return(
		<p>Connect to account to continue</p>
	)
}

function signTransaction(signer){
	signer.signMessage("test").then(
		(signature) => {console.log(signature)},
		(error) => {console.error(error)}
	)
}

function WalletBalance() {
	const {data: singer} = useSigner();
	const {data, isError, isLoading} = useBalance({
		address: singer._address,
	});

	if (isLoading) return <div>Fetching balance...</div>
	if (isError) return <div>Error fetching balance</div>
	return (
		<div>
			Balance: {data?.formatted} {data?.symbol}
		</div>
	)
}

function PageFooter() {
	return (
		<>
			<div className={styles.footer}>
				<p>footer</p>
			</div>
		</>
	)
}

function RequestTokens() {
	const {data: signer} = useSigner();
	const [txData, setTxDate] = useState(null);
	const [isLoading,setLoading] = useState(false);
	if (txData) return (
		<div>
			<p>Transaction completed!</p>
			<a href = {"https://sepolia.etherscan.io/tx/"+ txData.hash} target="_blank">
			{txData.hash}</a>
		</div>
	)
	if (isLoading) return <p>Requesting tokens to be minted...</p>;
	return (
		<div>
			<hi>Request Token </hi>
			<button onClick={()=>
				requestTokens(signer, "anything", setLoading, setTxDate)
			}> Request token</button>
		</div>
	)
}

function requestTokens(signer, signature, setLoading, setTxData){
	setLoading(true);
	console.log("ddddddddd")
	const requestOption = {
		method : 'POST',
		headers: {'Content-Type':'application/json'},
		body: JSON.stringify({address: signer._address, signature: signature})
	};
	fetch("http://localhost:3001/request-tokens", requestOption)
	.then(response => response.json())
	.then((data) =>{
		setTxData(data);
		setLoading(false);
	})
}

function Vote(){
	const {data: signer} = useSigner();
	const [isLoading,setLoading] = useState(false);
	const [content,setcontent] = useState();
	if (content) return (
		<div>
			<p>Voted!</p>
		</div>
	)
	if (isLoading) return <p>Voting...</p>;
	return (
		<div>
			<h1>Vote</h1>
			<button onClick={()=>
				vote(signer.address, 0, "1")
			}> Vote 1</button>
			<button onClick={()=>
				vote(signer.address, 1, "1")
			}> Vote 2</button>
			<button onClick={()=>
				vote(signer.address, 2, "1")
			}> Vote 3</button>
		</div>
	)
}

function vote(propos, v, setcontent){
	setLoading(true);
	const requestOption = {
		method : 'POST',
		headers: {'Content-Type':'application/json'},
		body: JSON.stringify({proposal: propos, votes: v})
	};
	fetch("http://localhost:3001/vote", requestOption)
	.then(response => response.json())
	.then((data) =>{
		setcontent("vote success!")
		setLoading(false)
	})
	
}
function Delegate(){
	const {data: signer} = useSigner();
	const [votes, setvotes] = useState(null);
	const [isLoading,setLoading] = useState(false);

	if (votes) return (
		<div>
			<p>Delegate completed! You have {votes} votes!</p>
		</div>
	)
	if (isLoading) return <p>Delegating...</p>;
	return (
		<div>
			<h1>Delegate</h1>
			<button onClick={()=>
				delegate(signer, setvotes, setLoading)
			}> delegate</button>
		</div>
	)

}
function delegate(signer, setvotes, setLoading){
	setLoading(true);
	const requestOption = {
		method : 'POST',
		headers: {'Content-Type':'application/json'},
		body: JSON.stringify({address: signer._address})
	};
	fetch("http://localhost:3001/delegate", requestOption)
	.then(response => response.json())
	.then((data) =>{
		setvotes(data)
		setLoading(false)
	})
}

function Result(){
	const [isLoading,setLoading] = useState(false);
	const [content,setcontent] = useState();

	const result = () =>{
		setLoading(true)
		fetch("http://localhost:3001/result")
		.then(res => res.json())
		.then((data) =>{
			console.log(data.result)
			setcontent(data.result);
			setLoading(false);
		}).catch((error) => {
			console.error('Error:', error);
		});
	}

	if (content) return (
		<div>
			<p>The winner is {content} !</p>
		</div>
	)
	if (isLoading) return <p>quering...</p>;
	return (
		<div>
			<button onClick={()=>result(setLoading, setcontent)}>Show result</button>
		</div>
	)
}
