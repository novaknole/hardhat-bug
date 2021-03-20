import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { TASK_ETHERSCAN_VERIFY } from 'hardhat-deploy'
import fs from 'fs'
import { file } from 'tmp-promise';
import HRE from 'hardhat'

const ZERO_ADDR = `0x${'00'.repeat(20)}`
const TWO_ADDRR = `0x${'00'.repeat(19)}02`
const NO_TOKEN = `0x${'00'.repeat(20)}`

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const verifyContract = async (
  address: string,
  constructorArguments: any[]
) => {
  const currentNetwork = HRE.network.name
  try {
   
    const msDelay = 3000
    const times = 30
    // Write a temporal file to host complex parameters for hardhat-etherscan https://github.com/nomiclabs/hardhat/tree/master/packages/hardhat-etherscan#complex-arguments
    const { fd, path, cleanup } = await file({
      prefix: 'verify-params-',
      postfix: '.js',
    })
    fs.writeSync(
      fd,
      `module.exports = ${JSON.stringify([...constructorArguments])};`
    )

    console.log(path, " path");

    const params = {
      address: address,
      constructorArgs: path,
    }
    await runTaskWithRetry('verify', params, times, msDelay, cleanup)
  } catch (error) {
      console.log(error, " error");
  }
}

const runTaskWithRetry = async (
  task: string,
  params: any,
  times: number,
  msDelay: number,
  cleanup: () => void
) => {
  let counter = times
  await delay(msDelay)

  try {
    if (times) {
      await HRE.run(task, params)
      cleanup()
    } 
  } catch (error) {
    counter--
    console.log(error.message);
    await runTaskWithRetry(task, params, counter, msDelay, cleanup)
  }
}



const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, run } = hre
  
  console.log('Verifying factories base contracts')

  const Test2 = await deployments.get('Test2')

  const Test2Contract = await ethers.getContractAt(
    'Test2',
    Test2.address
  )

  const base = await Test2Contract.base()

  await verifyContract(base, [10, 20])
}
export default func
func.runAtTheEnd = true
func.dependencies = [
  'Test2'
]