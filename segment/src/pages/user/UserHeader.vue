<template>
  <div class="user-header">
	  <div class="content">
		  <div class="avator-wrapper">
			<div class="avator pointer" @mouseover="showUpdAvator = true" @mouseleave="showUpdAvator = false">
				<img :src="avator" alt="" >
				<span class="upd-avator" v-show="showUpdAvator">上传头像</span>
			</div>
		  </div>
		  <!-- 用户信息 -->
		  <div class="user-info">
			<h2>{{userInfo.username}}</h2>
			<p class="info-item">手机号: {{userInfo.mobile}}</p>
			<p class='info-item'>邮箱: {{userInfo.email}}</p>
			<div class="badge">
				<span class="reputation">{{reputation}} 声望</span>
			</div>
			
		  </div>
	  </div>
  </div>
</template>

<script>
import { GET_USER_INFO } from '@/api/api';

export default {
	data(){
		return {
			avator:require('@/assets/images/user.png'),
			userName: '',
			reputation: 1,
			showUpdAvator: false,
			userInfo:{
				username: '',
				mobile: '',
				email: ''
			}
		}
	},
	methods:{
		// 获取用户信息
		getUserInfo(){
			GET_USER_INFO().then(res=>{
				let data = res.data
				console.log(data)
				if(data.code == 200){
					this.userInfo.username = data.data.username;
					this.userInfo.mobile = data.data.mobile == null ? '未填写' : data.data.mobile
					this.userInfo.email = data.data.email == null ?  '未填写' : data.data.email
				}
			})
		},

		// 更新一级导航状态
		updateWriteTypeCode(){
			this.$store.commit('updateWriteTypeCode',-1)
			
		}

	},
	mounted(){
		this.getUserInfo();
		
		this.updateWriteTypeCode();
	}
}
</script>

<style lang="less" scoped>
@import url(../../assets/css/mixin.less);

.user-header {
	width: 100%;
	height: 268px;
	background-color:#f5f5f5;

	// 内容区
	.content {
		width: 1116px;
		margin:0 auto;
		padding-top:40px;
		text-align: left;

		// 头像区
		.avator-wrapper {
			width: 160px;
			display: inline-block;
			margin-right: 30px;

			.avator {
				position: relative;
				width: 158px;
				height: 158px;
				border-radius: 50%;
				overflow: hidden;
				img {
					width: 158px;
					height: 158px;
					border-radius: 50%;
				}
				
				// 上传头像
				.upd-avator {
					position: absolute;
					bottom:0;
					left: 0;
					display: inline-block;
					width: 160px;
					height: 38px;
					line-height: 38px;
					background-color:rgba(0,0,0,0.7);
					color:#fff;
					text-align: center;
				}
	
			}
		}

		// 用户信息
		.user-info {
			width: 476px;
			display: inline-block;
			vertical-align: top;

			h2 {
				text-align: left;
				font-weight: 500;
				font-size: 30px;
				margin-bottom: 10px;
				display: inline-block;
			}
			
			.info-item {
				display: inline-block;
				font-size: 12px;
				color:#666;
				padding:5px;
			}
			
			// 徽章
			.badge {
				text-align: center;
	
				// 声望
				.reputation {
					float: left;
					width:70px;
					height:29px;
					line-height: 29px;
					text-align: center;
					border-radius:29px;
					border:1px solid @green;
					background-color: #dff1d9;
					color: @green;
				}
	
			}
		}

	}
}

</style>


