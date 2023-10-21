import {
  Args,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@ObjectType()
export class Vote {
  @Field(() => String)
  id: string;
  @Field(() => Int)
  value: number;
}

@Resolver(() => String)
export class IssueResolver {
  private votes: Map<string, number>;

  constructor() {
    this.votes = new Map();
    this.votes.set('default', 0);
  }

  @Query(() => Vote, { nullable: true })
  async getVotes(@Args('id') id: string): Promise<Vote | null> {
    if (this.votes.has(id)) {
      return {
        id,
        value: this.votes.get(id),
      };
    }

    return null;
  }

  @Mutation(() => Vote)
  async createVote(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Vote> {
    this.votes.set(id, 0);
    return {
      id,
      value: 0,
    };
  }

  @Mutation(() => Vote, { nullable: true })
  async upVote(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Vote | null> {
    if (this.votes.has(id)) {
      this.votes.set(id, this.votes.get(id) + 1);
      await pubSub.publish('voteUpdate', {
        voteUpdate: {
          id,
          value: this.votes.get(id),
        },
      });
      return {
        id,
        value: this.votes.get(id),
      };
    }

    return null;
  }

  @Subscription(() => Vote, {
    nullable: true,
    filter: (payload, variables: { id: string }) => {
      console.log('FILTER:', payload, variables);
      return payload.voteUpdate.id === variables.id;
    },
  })
  voteUpdate(): AsyncIterator<Vote> {
    return pubSub.asyncIterator('voteUpdate');
  }
}
