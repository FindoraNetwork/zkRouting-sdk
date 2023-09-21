const { exec } = require('child_process');

exec(`abi-types-generator './src/evm/abis/Erc20.json' --output='./src/evm/types' --name=Erc20 --provider=web3`);
exec(`abi-types-generator './src/evm/abis/Bridge.json' --output='./src/evm/types' --name=Bridge --provider=web3`);
exec(`abi-types-generator './src/evm/abis/Relayer.json' --output='./src/evm/types' --name=Relayer --provider=web3`);
