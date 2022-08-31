// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./BEP20.sol";

/// main contract
contract ITTIToken is BEP20Detailed, BEP20 {
    using SafeMath for uint256;

    IBEP20 public immutable _bep20UsdtContract; //bep20-usdt contract address

    struct node {
        address _inviter;
        string _type; // top/origin/sale/delegate/active
    }

    struct revenueData{
        address _addr;
        uint _revenue;
    }

    mapping(address => node) public _nodeMappings;

    address private _address_A0 = 0x86875936c949327fdeE36735097C419a109B6E44; //最顶上地址
    address private _address_A8 = 0xE588B9f41aFA2bfCc9c85837626Ab5217E6A7bef; 

    address private _address_A1 = 0x6bdf7b6CC27542cF98F0F3759F257124bd944D47; //28%
    address private _address_A2 = 0x516ef8c92f5fF7E5412Bfc0f3C2332Ac07aF6869; //4.5%
    address private _address_A3 = 0x8f8Db715162D817B4859B31a8f65a4FcEE94606d; //2.7%
    address private _address_A4 = 0x95e3FC4BD8156eA0914D421240f7199f0a457C46; //2.7%
    address private _address_A5 = 0xd39D17d1C85977fd132251bb8bddC3D837Fc784F; //1.8%
    address private _address_A6 = 0x43f9A6001af890C7C2cfF389ebB352F8Db37e3B9; //1.8%
    address private _address_A7 = 0x3D55F3D76Bcdad7B6Cf466FCeEa21929d10EC507; //13.5%

    address private _address_B1 = 0x7e8b098B9C349F52f57524fCb3e8Be836F6B2547;
    address private _address_B2 = 0x0d01644072b092C85cc067B2c75e3607eC497e25;
    address private _address_B3 = 0xbb649B591bB6Bc70fBee68342202a05399028dc4;
    address private _address_B4 = 0xFf1239Ef8336bB773CAE174a42B9371d8E62C0C9;
    address private _address_B5 = 0x595f425c7de86092863470118580dc4b43e99620;
    address private _address_B6 = 0x0A71141E0e06aad50BEAE1aa3E8038cf640Aa5D4;

    address private _address_C1 = 0x8445Be0EF04152cf5f480eA453a0016057b86B54;
    address private _address_C2 = 0xCEC8024D0924a584f955A36214b2CB6D8CDDCbc5;
    address private _address_C3 = 0xA48793682ab68d7AE5A6aCC54cDF301bD969ffC9;
    address private _address_C4 = 0xFbAd1CDAE13d0cB7581f95893392D06851107e74;       
    address private _address_C5 = 0x54Db95Dd972c68578bA2c17DcB28265b5f7AE096;
    address private _address_C6 = 0xcc732b0c898de08074d971832dCf78a120dea4fB;

    uint256 public _fixedDelegatePrice = 3000e18; //申请代理白所需固定usdt价格

    //私募总量 （14亿）
    uint256 public _preIpoTotalCoinAmount;
    //剩余可私募币量
    uint256 public _preIpoTotalCoinAmount_left;
    //当前已私募总usdt
    uint256 public _milestone = 0;
    //剩余白名单名额
    uint256 public _leftWhiteCount = 200;

    //当前价格区间
    //区间1:[0.001, 0.002) 总私募20亿枚；每个价格档位私募20/10=2亿枚ittc /// 每个价格挡位私募20/200 = 1000万个itti, 步长 0.000005
    //区间2:[0.002, 0.003) 总私募5亿枚；每个价格档位私募5/10=0.5亿枚ittc /// 每个价格挡位私募5/100 = 500万个itti，  步长 0.00001
    //区间3:[0.003, 0.00345)总私募1.6亿枚；每个价格档位私募1.6/10=0.16亿枚ittc///每挡位私募1.6/50 = 320万个itti，  步长 0.00001
    //区间4:[0.0035]        总私募70-20-5-1.6=43.4亿枚；价格固定，售完即止

    //当前价格挡位
    uint256 public _current_index = 1;
    //当前价格挡位剩余ittc
    uint256 public _current_offset;
    //当前步长(300万)
    uint256 public _current_step;
    //当前ITTC价格(初始0.001200u一枚)
    uint256 public _currentPrice_numerator = 1200 * 10**18; //价格的分子
    uint256 public _currentPrice_denominator = 1000000 * 10**18; //价格的分母

    constructor(IBEP20 bep20UsdtContract)
        BEP20Detailed("ITTI Token", "ITTI", 18)
    {
        _bep20UsdtContract = bep20UsdtContract;

        uint256 totalTokens = 100e8 * 1e18;    //总发行量 100亿
        _preIpoTotalCoinAmount = 14e8 * 1e18;  //私募总量14亿
        _preIpoTotalCoinAmount_left = _preIpoTotalCoinAmount;   //剩余私募量

        //初始发到合约创建者地址
        _mint(msg.sender, totalTokens);

        //初始化各区间步长
        // _regionStepConfig[1] = 1000 * 10**4 * 10**18; //区间1 ： 1000万枚
        // _regionStepConfig[2] = 500 * 10**4 * 10**18; //区间2 ： 500万枚
        // _regionStepConfig[3] = 320 * 10**4 * 10**18; //区间3 ： 320万枚

        //初始化起始步长, 当前档位剩余币数
        _current_step = 300e4 * 1e18;   //步长300w
        _current_offset = _current_step;

        //初始化 顶上地址
        _nodeMappings[_address_A0] = node(address(0), "top");
        //初始化 原始白名单
        _nodeMappings[_address_B1] = node(_address_A0, "origin"); //B1
        _nodeMappings[_address_C1] = node(_address_A0, "origin"); //C1
       

        //初始化 销售白名单 B1:B2-B6
        _nodeMappings[_address_B2] = node(_address_B1, "sale"); //B2
        _nodeMappings[_address_B3] = node(_address_B1, "sale"); //B3
        _nodeMappings[_address_B4] = node(_address_B1, "sale"); //B4
        _nodeMappings[_address_B5] = node(_address_B1, "sale"); //B5
        _nodeMappings[_address_B6] = node(_address_B1, "sale"); //B6
        //初始化 销售白名单 C1:C2-C6
        _nodeMappings[_address_C2] = node(_address_C1, "sale"); //C2
        _nodeMappings[_address_C3] = node(_address_C1, "sale"); //C3
        _nodeMappings[_address_C4] = node(_address_C1, "sale"); //C4
        _nodeMappings[_address_C5] = node(_address_C1, "sale"); //C5
        _nodeMappings[_address_C6] = node(_address_C1, "sale"); //C6

    }

    //增加原始白名单
    function addOrigin(address addr) public onlyOwner {
        require(addr != address(0), "Invalid address 0.");
        //必须是新地址
        require(isSameString(_nodeMappings[addr]._type,"") && _nodeMappings[addr]._inviter == address(0), "Already activated.");

        //加入origin白名单
        _nodeMappings[addr] = node(_address_A0, "origin");
    }

    //增加销售白名单
    function addSale(address inviter, address addr) public onlyOwner {
        require(inviter != address(0), "Invalid inviter address 0.");
        require(addr != address(0), "Invalid address 0.");
        //邀请人必须是origin
        require(isSameString(_nodeMappings[inviter]._type,"origin"));
        //必须是新地址
        require(isSameString(_nodeMappings[addr]._type,"") && _nodeMappings[addr]._inviter == address(0), "Already activated.");

        //加入sale白名单
        _nodeMappings[addr] = node(inviter, "sale");
    }

    //申请认购代理白名单资格，花费一定的usdt，并获得300万itti
    function applyForDelegate(address inviterAddress) public {
        //代理白名单还有名额
        require(_leftWhiteCount > 0, "Insufficient white list.");
        //认购者的u要足够
        require(_bep20UsdtContract.balanceOf(msg.sender) >= _fixedDelegatePrice,"Insufficient balance."); 
        //不可重复认购
        require(_nodeMappings[msg.sender]._inviter == address(0),"Already delegate."); 
        //邀请人必须是销售白, 并且不能是自己
        require((msg.sender != inviterAddress) && isSameString(_nodeMappings[inviterAddress]._type, "sale"), "Invalid inviter."); 

        //收取用户的u
        _bep20UsdtContract.transferFrom(msg.sender, address(this), _fixedDelegatePrice);

        //记录邀请关系，加入代理白名单
        _nodeMappings[msg.sender] = node(inviterAddress, "delegate"); 

        //白名单名额-1
        _leftWhiteCount--;

        //发300万itti
        _transfer(address(this), msg.sender, 300e4 * 1e18);

        //层级分红
        DistributeRewardRevenue(msg.sender, _fixedDelegatePrice, "white");   
        
    }

    //新地址激活，并绑定邀请关系
    function activateAddress(address inviter) public returns(bool){
        //必须是新地址
        require(isSameString(_nodeMappings[msg.sender]._type,"") && _nodeMappings[msg.sender]._inviter == address(0), "Already activated.");
        //邀请人地址不为0,且必须是delegate或者active
        require(inviter != address(0) && (isSameString(_nodeMappings[inviter]._type, "delegate") || isSameString(_nodeMappings[inviter]._type, "active")), "Invalid inviter address.");

        //添加邀请关系
        _nodeMappings[msg.sender] = node(inviter, "active"); 

        return true;
    }

    //用U购买ITTC
    function enchangeTokenWithUsdt(uint256 usdtAmount) public returns(uint256,uint256,uint256){
        //delegate或者active才有资格购买
        require(isSameString(_nodeMappings[msg.sender]._type, "delegate") || isSameString(_nodeMappings[msg.sender]._type, "active"), "Auth denied.");
        //邀请人必须是delegate或者sale或者active
        require(_nodeMappings[msg.sender]._inviter != address(0) 
        && (isSameString(_nodeMappings[_nodeMappings[msg.sender]._inviter]._type,"delegate") 
        || isSameString(_nodeMappings[_nodeMappings[msg.sender]._inviter]._type,"sale") 
        || isSameString(_nodeMappings[_nodeMappings[msg.sender]._inviter]._type,"active")), "Invalid inviter.");
        //参数usdt必须大于1u
        require(usdtAmount > 1e18, "Invalid amount"); 
        //认购者的u余额要足够
        require(_bep20UsdtContract.balanceOf(msg.sender) >= usdtAmount, "Insufficient balance."); 
        //私募未结束
        require(_preIpoTotalCoinAmount_left > 0, "Event finished."); 

        //计算并分配（ITTC个数, 实际花费u）
        (
            uint256 coinAmount,
            uint256 costUsdt
        ) = DistributeCoinAmount(usdtAmount);

        //合约地址上的ittc要足够
        require(balanceOf(address(this)) >= coinAmount, "Insufficient token.");

        //收U到合约地址
        _bep20UsdtContract.transferFrom(msg.sender, address(this), costUsdt);

        //层级分红
        DistributeRewardRevenue(msg.sender, costUsdt, "exchange");   

        //发币给用户
        _transfer(address(this),msg.sender, coinAmount);
        
        return (coinAmount, costUsdt, 0);
    }

    function DistributeCoinAmount(uint256 usdtAmount)
        private
        returns (
            uint256,
            uint256
        )
    {
        require(usdtAmount > 1e18, "Invalid param amount.");
        require(_preIpoTotalCoinAmount_left > 1e18, "Event finished.");

        uint256 _totalCoinAmount = 0; //总ittc数
        uint256 _actualUsdtAmount = 0;
        uint256 _leftUsdtAmount = usdtAmount;

        //u还有剩余 && 私募额还未满
        while (_leftUsdtAmount > 1 && _preIpoTotalCoinAmount_left > 1) {
            
            uint256 currentActualCoinAmount = 0;    //计算出来的 当前价位实际购买ITTC数量

            //剩余u 能买多少个当前档位价格的ittc
            uint256 temp_amount = _leftUsdtAmount.mul(_currentPrice_denominator).div(_currentPrice_numerator);

            //不跨档: 档位余币足够
            if(temp_amount <= _current_offset){
                currentActualCoinAmount = temp_amount;
            }
            //跨档: 档位余币买完先
            else {
                currentActualCoinAmount = _current_offset;  //实际所买币数即 = 当前档位余币
            }

            //剩余可私募币数不足这么多量了：把全部私募余量卖完
            if (currentActualCoinAmount > _preIpoTotalCoinAmount_left) {
                currentActualCoinAmount = _preIpoTotalCoinAmount_left; //当前档位实际买币数
            }

            //累加当前档位实际所花usdt
            uint256 u = currentActualCoinAmount.mul(_currentPrice_numerator).div(_currentPrice_denominator);

            _actualUsdtAmount += u; //当前档位实际购买花费u
            _leftUsdtAmount -= u; //剩余可购买的u
            _milestone += u; //累计私募usdt额

            _current_offset -= currentActualCoinAmount; //更新当前档位币余量
            _preIpoTotalCoinAmount_left -= currentActualCoinAmount; //剩余私募额减少
            _totalCoinAmount += currentActualCoinAmount; //买币总数累加

            //当前档位余量售完，进到下一档位
            if (_current_offset <= 0) {
                // //1到20
                // if(_current_index <= 20){
                //     _currentPrice_numerator += 10 * 10**18; //前20个档位，价格分子变化幅度相同 + 0.0001
                //     //10跨到11 特殊处理
                //     if(_current_index == 10){
                //         _current_step = _regionStepConfig[2];   //11开始 步长变小
                //     }
                //     else if(_current_index == 20){
                //         _current_step = _regionStepConfig[3];   //21开始 步长再变小
                //     }
                // }                               
                // //20到30
                // else if(_current_index > 20 && _current_index < 30){
                //     _currentPrice_numerator += 5 * 10**18; //21开始 价格幅度缩小 + 0.00005
                // }
                // //31到结束
                // else if(_current_index >= 30){
                //     _current_step = _preIpoTotalCoinAmount_left;   //步长 = 剩余私募总量
                //     //30跨到31 特殊处理
                //     if(_current_index == 30){
                //         _currentPrice_numerator += 5 * 10**18; //价格最后一次变化 + 0.00005
                //     }
                // }
                // _current_offset = _current_step;    //档位余量重置
                // _current_index++;   //下一档位


                // //1-200
                // if(_current_index <= 200){
                //     _currentPrice_numerator += 5 * 10**18;
                //     //201开始步长变小
                //     if(_current_index == 200){
                //         _current_step = _regionStepConfig[2]; 
                //     }
                // }
                // //201-300
                // else if(_current_index <= 350){
                //     _currentPrice_numerator += 10 * 10**18;
                //     //301开始步长变小
                //     if(_current_index == 300){
                //         _current_step = _regionStepConfig[3]; 
                //     }
                //     //351开始步长=余量
                //     else if(_current_index == 350){
                //         _current_step = _preIpoTotalCoinAmount_left; 
                //     }
                // }
                // //351-
                // else {
                //     _current_step = _preIpoTotalCoinAmount_left; 
                // }

                //价格涨0.000005， 步长不变
                _currentPrice_numerator += 5 * 10**18;
                if(_current_index == 466){
                    _current_step = _preIpoTotalCoinAmount_left; //第467个价格区间开始，步长=剩余私募量
                }

                _current_offset = _current_step;    //档位余量重置
                _current_index++;   //下一档位

            }
        }
        return (_totalCoinAmount, _actualUsdtAmount);
    }

    function DistributeRewardRevenue(address buyer, uint256 usdtAmount, string memory _type) private {
        require(usdtAmount > 0, "Invalid param.");

        //A1 28%
        _bep20UsdtContract.transfer(_address_A1, usdtAmount.mul(28).div(100));
        //A2 4.5%
        _bep20UsdtContract.transfer(_address_A2, usdtAmount.mul(45).div(1000));
        //A3 2.7%
        _bep20UsdtContract.transfer(_address_A3, usdtAmount.mul(27).div(1000));
        //A4 2.7%
        _bep20UsdtContract.transfer(_address_A4, usdtAmount.mul(27).div(1000));
        //A5 1.8%
        _bep20UsdtContract.transfer(_address_A5, usdtAmount.mul(18).div(1000));
        //A6 1.8%
        _bep20UsdtContract.transfer(_address_A6, usdtAmount.mul(18).div(1000));
        //A7 13.5%
        _bep20UsdtContract.transfer(_address_A7, usdtAmount.mul(135).div(1000));

        //原始白 平分18%
        // uint eachOrigin = usdtAmount.mul(_levelRewardConfig[30000]._numerator).div(_levelRewardConfig[30000]._denominator).div(_originArr.length);
        // for(uint i=0;i<_originArr.length;i++){
        //     _bep20UsdtContract.transfer(_originArr[i], eachOrigin);
        // }
        //销售白 平分15%
        // uint eachSale = usdtAmount.mul(_levelRewardConfig[20000]._numerator).div(_levelRewardConfig[20000]._denominator).div(_saleArr.length);
        // for(uint j=0;j<_saleArr.length;j++){
        //     _bep20UsdtContract.transfer(_saleArr[j], eachSale);
        // }

        //原始白18%，销售白15%，代理白 分12%
        uint _leftNumerator = 45; //总共45个点
        //存该笔订单的所有分红者数据(5 2 1 1 1 2 15 18)
        revenueData[] memory revenueDatas = new revenueData[](8);
        address _currentInviter = buyer; //自己也能拿
        uint index = 0;

        //先把自己也算到受益人里,只不过收益暂且设为0。如果自己是代理，则自己也可拿自己的2%
        revenueDatas[index] = revenueData(buyer, 0);
        index = 1;    //1

        //当前邀请人必须是active|delegate|sale|origin 且 45个点还没分完，才有收益可拿
        while(_currentInviter != address(0) && _leftNumerator > 0){
            
            if(isSameString(_nodeMappings[_currentInviter]._type, "delegate") || isSameString(_nodeMappings[_currentInviter]._type, "active")){
                //直推delegate或active,拿5%;
                if(_currentInviter == _nodeMappings[buyer]._inviter){
                    require(_leftNumerator == 45, "Error Code:1");
                    revenueDatas[index] = revenueData(_currentInviter, usdtAmount.mul(5).div(100));
                    _leftNumerator = _leftNumerator.sub(5);  // -5%
                    index++;    //2
                }
                //间推delegate或active
                else{
                    //2代拿2%
                    if(index == 2){
                        require(_leftNumerator == 40, "Error Code:2");
                        revenueDatas[index] = revenueData(_currentInviter, usdtAmount.mul(2).div(100));
                        _leftNumerator = _leftNumerator.sub(2);  // -2%
                        index++;  
                    }
                    //3代拿1%
                    else if (index == 3){
                        require(_leftNumerator == 38, "Error Code:3");
                        revenueDatas[index] = revenueData(_currentInviter, usdtAmount.mul(1).div(100));
                        _leftNumerator = _leftNumerator.sub(1);  // -1%
                        index++;  
                    }
                    //4代拿1%
                    else if (index == 4){
                        require(_leftNumerator == 37, "Error Code:4");
                        revenueDatas[index] = revenueData(_currentInviter, usdtAmount.mul(1).div(100));
                        _leftNumerator = _leftNumerator.sub(1);  // -1%
                        index++;  
                    }
                    //5代拿1%
                    else if (index == 5){
                        require(_leftNumerator == 36, "Error Code:5");
                        revenueDatas[index] = revenueData(_currentInviter, usdtAmount.mul(1).div(100));
                        _leftNumerator = _leftNumerator.sub(1);  // -1%
                        index++;  
                    }
                }
            }
            

            //代理，再拿保底2% (如果是买白名单，则不拿)
            if(isSameString(_nodeMappings[_currentInviter]._type, "delegate")){
                if(isSameString(_type, "exchange")){
                    require(_leftNumerator >= 35, "Error Code:51");
                    revenueDatas[0] = revenueData(_currentInviter, usdtAmount.mul(2).div(100));
                    _leftNumerator = _leftNumerator.sub(2);  // -2%
                }
            }
            //销售白，拿15%
            else if(isSameString(_nodeMappings[_currentInviter]._type, "sale")){
                require(_leftNumerator >= 33, "Error Code:52");
                revenueDatas[6] = revenueData(_currentInviter, usdtAmount.mul(15).div(100));
                _leftNumerator = _leftNumerator.sub(15);  // -15%
            }
            //原始白，拿18%
            else if(isSameString(_nodeMappings[_currentInviter]._type, "origin")){
                require(_leftNumerator >= 18, "Error Code:53");
                revenueDatas[7] = revenueData(_currentInviter, usdtAmount.mul(18).div(100));
                _leftNumerator = _leftNumerator.sub(18);  // -18%
                break;
            }
            
            //再上一层
            _currentInviter = _nodeMappings[_currentInviter]._inviter;
        }

        //遍历，发521112 15 18收益
        for(uint i=0;i<revenueDatas.length;i++){
            //收益需要大于0
            if(revenueDatas[i]._revenue > 0){
                _bep20UsdtContract.transfer(revenueDatas[i]._addr, revenueDatas[i]._revenue);
            }
        }

        //若12%中还有剩余,则全部打到A8地址 
        if(_leftNumerator > 0){
            _bep20UsdtContract.transfer(_address_A8, usdtAmount.mul(_leftNumerator).div(100));
            _leftNumerator = 0;
        }

    }

    //把合约地址上的u 转到A0地址
    function withdrewUsdtToA0() public onlyOwner {
        uint balance = _bep20UsdtContract.balanceOf(address(this));

        require(balance > 0, "Balance is 0.");
        
        _bep20UsdtContract.transfer(_address_A0, balance);  //msg.sender 是 ittc合约, 而不是用户
    }

    //把合约地址上的ittc 转到A0地址
    function withdrewIttcToA0() public onlyOwner {
        uint balance = balanceOf(address(this));

        require(balance > 0, "Balance is 0.");
        
        _transfer(address(this),_address_A0, balance);
    }

    // 比较2个字符串是否相等
    function isSameString(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        if (bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(abi.encode(a)) == keccak256(abi.encode(b));
        }
    }
}
