<?php

namespace App\GraphQL\Mutations;

use App\Models\Request;
use Exception;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Override the original class because that always expects an email & password combination
 * Shoutz0r however uses a username & password combination
 */
class LastPlayed
{
    /**
     * @param mixed $_
     * @param array<string, string> $args
     * @return string[]
     * @throws Exception
     */
    public function __invoke($_, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        $lastPlayed = Request::query()
            ->with(['requested_by', 'media.artists'])
            ->whereNotNull('played_at')
            ->orderByDesc('played_at')
            ->first();

        return [
            'request' => $lastPlayed,
        ];
    }
}