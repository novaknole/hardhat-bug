import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const a = await deploy('T1', {
    from: deployer,
    log: true,
    deterministicDeployment: true,
  })

  const b = await deploy('T2', {
    from: deployer,
    log: true,
    deterministicDeployment: true,
  })


  await deploy('Test2', {
    from: deployer,
    args: [
      a.address,
      b.address
    ],
    log: true,
    deterministicDeployment: true,
  })

}
export default func
func.tags = [
  'Test2'
]
